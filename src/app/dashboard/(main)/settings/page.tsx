import type { Metadata } from "next";
import { redirect, RedirectType } from "next/navigation";
import SettingsForm from "@/components/organisms/SettingsForm";
import { prisma } from "@/lib/prisma";
import Indicator from "@/components/Indicator";
import requireAuth from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تنظیمات | سفارش‌یار",
};

const Settings = async () => {
  const auth = await requireAuth({
    role: "USER",
    redirectOnForbidden: true,
  });

  const userData = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      phoneNumber: true,
      store: {
        select: {
          name: true,
          cardNumber: true,
          cardOwnerName: true,
          iban: true,
        },
      },
    },
  });

  if (!userData) redirect("/?login=true", RedirectType.replace);

  const user = {
    phoneNumber: userData.phoneNumber,
    shopName: userData.store.name,
    cardNumber: userData.store.cardNumber,
    cardOwnerName: userData.store.cardOwnerName,
    iban: userData.store.iban,
  };

  return (
    <>
      <div className="w-full rounded-4xl p-3 bg-card space-y-6">
        <Indicator title="تنظیمات" />

        <SettingsForm user={user} />
      </div>
    </>
  );
};

export default Settings;
