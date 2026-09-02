"use server";

import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/validation/settings.schema";
import { handleCatch } from "@/utils/function";
import requireAuth from "@/lib/requireAuth";

export const updateUserSettings = async ({ shopName, cardNumber, cardOwnerName, iban }: { shopName?: string; cardNumber?: string; cardOwnerName?: string; iban?: string }) => {
  try {
    const auth = await requireAuth({ role: "USER" });

    const parsed = settingsSchema.parse({ shopName, cardNumber, cardOwnerName, iban });

    await prisma.store.update({
      where: { id: auth.user.storeId },
      data: {
        name: parsed.shopName || undefined,
        cardNumber: parsed.cardNumber || null,
        cardOwnerName: parsed.cardOwnerName || null,
        iban: parsed.iban || null,
      },
    });

    return { message: "تنظیمات با موفقیت ذخیره شد", status: 200 };
  } catch (error) {
    return handleCatch(error);
  }
};
