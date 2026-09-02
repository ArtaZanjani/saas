"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  generateTokens,
  hashData,
  verifyHash,
  verifyToken,
  hashOtp,
  verifyOtpHash,
} from "@/utils/auth";
import { handleCatch, toEnglishDigits } from "@/utils/function";
import { phoneNumberSchema } from "@/validation/global.schema";
import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";
import { cache } from "react";
import {
  slidingWindowRateLimit,
  OTP_REQUEST_LIMIT,
  OTP_VERIFY_LIMIT,
} from "@/lib/rateLimit";

const CONSUME_OTP_SCRIPT = `
local key = KEYS[1]
local expected = ARGV[1]
local current = redis.call('GET', key)
if current == expected then
  redis.call('DEL', key)
  return 1
end
return 0
`;

const formatRetryTime = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ساعت`);
  if (minutes > 0) parts.push(`${minutes} دقیقه`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} ثانیه`);

  return parts.join(" و ");
};

const cookieBase = {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const setAuthCookies = async (access: string, refresh: string) => {
  const c = await cookies();
  c.set("accessToken", access, { ...cookieBase, maxAge: 15 * 60 });
  c.set("refreshToken", refresh, { ...cookieBase, maxAge: 60 * 24 * 60 * 60 });
};

export const requestOtpAction = async ({
  phoneNumber,
}: {
  phoneNumber: string;
}) => {
  try {
    const num = toEnglishDigits(phoneNumber);
    phoneNumberSchema.parse(phoneNumber);

    const existingTtl = await redis.ttl(`otp:${num}`);
    if (existingTtl > 0) {
      return {
        message: `کد قبلی هنوز معتبر است. ${formatRetryTime(existingTtl * 1000)} صبر کنید.`,
        status: 200,
      };
    }

    const rateLimit = await slidingWindowRateLimit(
      `otp:request:${num}`,
      OTP_REQUEST_LIMIT,
    );

    if (!rateLimit.allowed) {
      return {
        message: `درخواست‌های شما بیش از حد مجاز است. لطفاً ${formatRetryTime(rateLimit.retryAfterMs)} صبر کنید.`,
        status: 429,
        retryAfterMs: rateLimit.retryAfterMs,
      };
    }

    const otp = randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(otp);

    const created = await redis.set(`otp:${num}`, hashedOtp, "EX", 120, "NX");

    if (!created) {
      const ttl = await redis.ttl(`otp:${num}`);
      return {
        message: `کد قبلی هنوز معتبر است. ${formatRetryTime(ttl * 1000)} صبر کنید.`,
        status: 200,
      };
    }

    if (process.env.NODE_ENV === "development") console.log(otp);

    return { message: `این یک نمونه کار تستی میباشد کد: ${otp}`, status: 200 };
  } catch (error) {
    return handleCatch(error);
  }
};

export const handleUserLogin = async (userId: string) => {
  const { accessToken, refreshToken } = generateTokens(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: await hashData(refreshToken) },
  });
  await setAuthCookies(accessToken, refreshToken);
  return { accessToken, refreshToken };
};

export const verifyOtp = async ({
  phoneNumber,
  otp,
}: {
  phoneNumber: string;
  otp: string;
}) => {
  try {
    const num = toEnglishDigits(phoneNumber);
    phoneNumberSchema.parse(phoneNumber);

    const rateLimit = await slidingWindowRateLimit(
      `otp:verify:${num}`,
      OTP_VERIFY_LIMIT,
    );
    if (!rateLimit.allowed) {
      return {
        message: `تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً ${formatRetryTime(rateLimit.retryAfterMs)} صبر کنید.`,
        status: 429,
        retryAfterMs: rateLimit.retryAfterMs,
      };
    }

    const storedHash = await redis.get(`otp:${num}`);
    if (!storedHash) {
      return {
        message: "برای این شماره کد تاییدی ارسال نشده است.",
        status: 400,
      };
    }

    const valid = verifyOtpHash(toEnglishDigits(otp), storedHash);
    if (!valid) {
      return {
        message: "کد وارد شده صحیح نیست. دوباره بررسی کنید.",
        status: 400,
      };
    }

    const consumed = (await redis.eval(
      CONSUME_OTP_SCRIPT,
      1,
      `otp:${num}`,
      storedHash,
    )) as number;
    if (!consumed) {
      return { message: "کد قبلاً استفاده شده است.", status: 400 };
    }

    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: { phoneNumber: num },
      });

      if (existing) return existing;

      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 14);

      const store = await tx.store.create({
        data: {
          name: "",
          instagramHandle: num,
          subscriptionEndsAt,
        },
      });

      const userCount = await tx.user.count();

      return tx.user.create({
        data: {
          phoneNumber: num,
          name: num,
          storeId: store.id,
          role: userCount === 0 ? UserRole.ADMIN : UserRole.USER,
        },
      });
    });

    await handleUserLogin(user.id);
  } catch (error) {
    return handleCatch(error);
  }

  redirect("/dashboard", RedirectType.replace);
};

export const verifyUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const handleToken = async (token: string, rotation: boolean) => {
      const decoded = verifyToken(token);
      if (!decoded?.id) throw new Error("Invalid token payload");

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          storeId: true,
          role: true,

          store: {
            select: {
              subscriptionPlan: true,
              _count: {
                select: {
                  orders: true,
                },
              },
            },
          },

          products: {
            select: {
              id: true,
              productName: true,
              price: true,
            },
          },

          refreshToken: true,
        },
      });

      if (!user) throw new Error("User not found");

      if (rotation) {
        if (!user.refreshToken) throw new Error("Refresh token invalid");
        const valid = await verifyHash(token, user.refreshToken);
        if (!valid) throw new Error("Refresh token invalid");
      }

      return { user, rotation };
    };

    if (accessToken) return await handleToken(accessToken, false);
    if (refreshToken) return await handleToken(refreshToken, true);

    return null;
  } catch {
    return null;
  }
});

export const logout = async () => {
  try {
    const userId = (await verifyUser())?.user.id;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
        },
      });
    }

    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
  } catch {}
};
