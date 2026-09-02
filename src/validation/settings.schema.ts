import * as z from "zod";
import { toEnglishDigits } from "@/utils/function";

const toEnglish = (val: string) => toEnglishDigits(val).replace(/\s/g, "");

const cardNumberSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{16}$/.test(toEnglish(val)), "شماره کارت باید ۱۶ رقم باشد");

const cardOwnerNameSchema = z
  .string()
  .optional()
  .refine((val) => !val || val.trim().length >= 3, "نام صاحب کارت باید حداقل ۳ حرف باشد");

const ibanSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    const clean = toEnglish(val).replace(/\s/g, "");
    return clean.length === 0 || clean.length === 24;
  }, "شماره شبا باید ۲۴ رقم باشد");

export const settingsSchema = z.object({
  shopName: z.string().optional(),
  cardNumber: cardNumberSchema,
  cardOwnerName: cardOwnerNameSchema,
  iban: ibanSchema,
});
