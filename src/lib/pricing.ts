import { SubscriptionPlan } from "@/generated/prisma/enums";
import { BillingInterval } from "@/generated/prisma/enums";
import { toPersianDigits } from "@/utils/function";
import {
  Box,
  Chart,
  Headphone,
  Profile2User,
  ShoppingCart,
  Wallet,
} from "iconsax-reactjs";
import { MAX_FREE_ORDER } from "./constants";

export const discountPercent = 20;

export const plans = [
  {
    id: SubscriptionPlan.FREE,
    name: "رایگان",
    info: "برای شروع",
    price: 0,
    features: [
      {
        text: `ثبت تا ${toPersianDigits(MAX_FREE_ORDER)} سفارش`,
        icon: Box,
      },
    ],
    btn: "شروع رایگان",
  },
  {
    id: SubscriptionPlan.PRO,
    highlighted: true,
    name: "حرفه‌ای",
    info: "برای کسب‌وکارهای کوچک تا متوسط",
    price: 300000,
    features: [
      {
        text: "محصولات نامحدود",
        icon: Box,
      },
      {
        text: "کاربران و مشتریان نامحدود",
        icon: Profile2User,
      },
      {
        text: "مدیریت درآمد و عملکرد",
        icon: Wallet,
      },
    ],
    btn: "خرید اشتراک",
  },
] as const;

export const billingFrequencies = [
  { id: BillingInterval.MONTHLY, label: "ماهانه" },
  { id: BillingInterval.YEARLY, label: "سالانه" },
] as const;