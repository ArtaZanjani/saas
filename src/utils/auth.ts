import { hash, compare } from "bcryptjs";
import { sign, verify, type JwtPayload } from "jsonwebtoken";
import { readFileSync } from "fs";
import { join } from "path";
import crypto from "crypto";

const privateKey = readFileSync(join(process.cwd(), "keys", "private.pem"), "utf8");
const publicKey = readFileSync(join(process.cwd(), "keys", "public.pem"), "utf8");

const hashData = async (data: string) => {
  return hash(data, 12);
};

const verifyHash = async (data: string, hashedData: string) => {
  return compare(data, hashedData);
};

const generateTokens = (id: string) => {
  const accessToken = sign({ id }, privateKey, {
    expiresIn: "15m",
    algorithm: "RS256",
  });
  const refreshToken = sign({ id }, privateKey, {
    expiresIn: "60d",
    algorithm: "RS256",
  });
  return { accessToken, refreshToken };
};

interface verifyTokenReturnType extends JwtPayload {
  id: string;
}

const verifyToken = (token: string): verifyTokenReturnType | null => {
  try {
    const data = verify(token, publicKey, {
      algorithms: ["RS256"],
    });

    if (!data || typeof data !== "object" || typeof data.id !== "string") {
      return null;
    }

    return data as verifyTokenReturnType;
  } catch {
    return null;
  }
};

export const hashOtp = (otp: string) => {
  const secret = process.env.OTP_SECRET;

  if (!secret) throw new Error("OTP_SECRET missing");

  return crypto.createHmac("sha256", secret).update(otp).digest("hex");
};

export const verifyOtpHash = (otp: string, hashedOtp: string) => {
  try {
    const hash = Buffer.from(hashOtp(otp), "hex");
    const stored = Buffer.from(hashedOtp, "hex");

    return hash.length === stored.length && crypto.timingSafeEqual(hash, stored);
  } catch {
    return false;
  }
};

export { hashData, verifyHash, generateTokens, verifyToken };
