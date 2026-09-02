import { ZodError } from "zod";

export const toPersianDigits = (num: number | string): string => {
  return num.toString().replace(/\d/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
};

export const toEnglishDigits = (num: number | string): string => {
  return num
    .toString()
    .replace(/[۰-۹]/g, (d: string) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d: string) => String(d.charCodeAt(0) - 1632));
};

export const handleCatch = (error?: unknown) => {
  if (error instanceof ZodError) {
    const input = error.issues.map((issue) => ({
      name: issue.path.join(".") || "unknown",
      message: issue.message,
    }));

    return { message: error.issues[0].message, status: 400, input };
  }
  if (error && typeof error === "object" && "message" in error && "status" in error) {
    return {
      message: String(error.message),
      status: Number(error.status),
    };
  }
  return { message: "خطا در ارتباط با سرور لطفا کمی بعد تلاش کنید", status: 500 };
};
