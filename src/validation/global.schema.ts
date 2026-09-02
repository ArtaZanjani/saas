import { toEnglishDigits } from "@/utils/function";
import * as z from "zod";

const phoneRegex = /^09(0[1-5]|1[0-9]|2[0-2]|3[0-9]|9[0-4]|99)\d{7}$/;

export const phoneNumberSchema = z
  .string()
  .min(1, "وارد کردن شماره تلفن الزامی است")
  .length(11, "شماره تلفن باید ۱۱ رقم باشد")
  .transform((value) => toEnglishDigits(value?.trim() || ""))
  .refine((val: string) => phoneRegex.test(val), "شماره تلفن وارد شده معتبر نیست");
