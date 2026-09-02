"use server";

import { handleCatch } from "@/utils/function";
import { paymentSchema } from "@/validation/payment.schema";
import {
  BillingInterval,
  PaymentStatus,
  SubscriptionPlan,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { generateUploadUrl, removeImage } from "@/lib/s3";
import { revalidatePath } from "next/cache";

export const generateReceiptUploadUrl = async ({
  contentType,
}: {
  contentType: string;
}) => {
  try {
    const auth = await requireAuth({ role: "USER" });

    const extension = contentType.split("/")[1] ?? "png";
    const key = `receipts/${auth.user.storeId}-${Date.now()}.${extension}`;

    const { url } = await generateUploadUrl({ key, contentType });

    return {
      url,
      src: `${process.env.S3_URL}/${key}`,
      message: "ok",
      status: 200 as const,
    };
  } catch (error) {
    return handleCatch(error);
  }
};

export const sendPayment = async ({
  receipt,
  interval,
  src,
}: {
  receipt: File;
  interval: BillingInterval;
  src: string;
}) => {
  try {
    const auth = await requireAuth({ role: "USER" });

    if (!Object.values(BillingInterval).includes(interval))
      throw { message: "بازه پرداخت نامعتبر است", status: 400 };

    if (!src) throw { message: "فیش واریز آپلود نشده است", status: 400 };

    paymentSchema.parse({ receipt });

    const subscriptionEndsAt = new Date();

    if (interval === BillingInterval.MONTHLY) {
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
    }
    if (interval === BillingInterval.YEARLY) {
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
    }

    await prisma.payment.create({
      data: { storeId: auth.user.storeId, interval, src },
    });

    return { message: "رسید پرداخت ثبت شد و در انتظار تایید است", status: 200 };
  } catch (error) {
    return handleCatch(error);
  }
};

export const updatePaymentStatus = async ({
  id,
  storeId,
  paymentStatus,
}: {
  id: string;
  storeId: string;
  paymentStatus: Exclude<PaymentStatus, "PENDING">;
}) => {
  try {
    await requireAuth({ role: "ADMIN" });

    const payment = await prisma.payment.findFirst({ where: { id, storeId } });

    if (!payment) throw { message: "پرداخت مورد نظر یافت نشد", status: 404 };

    const subscriptionEndsAt = new Date();
    if (payment.interval === BillingInterval.MONTHLY)
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
    if (payment.interval === BillingInterval.YEARLY)
      subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);

    const { count } = await prisma.$transaction(async (tx) => {
      const result = await tx.payment.updateMany({
        where: { id, storeId, paymentStatus: PaymentStatus.PENDING },
        data: { paymentStatus, src: "" },
      });

      if (result.count === 0) return result;

      if (paymentStatus === PaymentStatus.ACCEPTED) {
        await tx.store.update({
          where: { id: storeId },
          data: { subscriptionPlan: SubscriptionPlan.PRO, subscriptionEndsAt },
        });
      }

      return result;
    });

    if (count === 0)
      throw { message: "این پرداخت قبلاً بررسی شده است", status: 400 };

    await removeImage(payment.src);
    revalidatePath("/dashboard/admin");

    return {
      message:
        paymentStatus === PaymentStatus.ACCEPTED
          ? "پرداخت تایید شد و اشتراک فعال گردید"
          : "پرداخت رد شد",
      status: 200,
    };
  } catch (error) {
    return handleCatch(error);
  }
};
