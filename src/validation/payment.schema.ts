import * as z from "zod";

const maxFileSize = 5 * 1024 * 1024;
export const acceptedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const fileSchema = z
  .instanceof(File)
  .refine((file) => acceptedFileTypes.includes(file.type), "فقط فرمت‌های PNG, JPG, JPEG, WEBP مجاز هستند")
  .refine((file) => file.size <= maxFileSize, "حداکثر حجم فایل ۵ مگابایت است");

export const paymentSchema = z.object({
  receipt: fileSchema,
});
