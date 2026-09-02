import * as z from "zod";

const newProductSchema = z.object({
  productName: z.string().min(1, "وارد کردن نام محصول الزامی است"),
  price: z
    .string()
    .min(1, "وارد کردن قیمت الزامی است")
    .regex(/^[0-9,]+$/, "قیمت فقط می‌تواند شامل اعداد باشد")
    .refine((val) => val.replace(/,/g, "").length > 0, "قیمت نمی‌تواند خالی باشد")
    .transform((val) => Number(val.replace(/,/g, "")))
    .pipe(z.number().int().positive("قیمت باید بیشتر از صفر باشد").max(2_000_000_000, "حداکثر مبلغ قابل ثبت ۲ میلیارد تومان است. در صورت نیاز به ثبت مبالغ بالاتر، به پشتیبانی پیام دهید تا این محدودیت برای حساب شما برداشته شود.")),
});

export default newProductSchema;
