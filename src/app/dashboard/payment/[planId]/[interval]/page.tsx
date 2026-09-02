import type { Metadata } from "next";
import { SubscriptionPlan } from "@/generated/prisma/enums";
import { redirect, RedirectType } from "next/navigation";
import { BillingInterval } from "@/generated/prisma/client";
import PaymentForm from "@/components/organisms/PaymentForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پرداخت | سفارش‌یار",
};

const Payment = async ({ params }: PageProps<"/dashboard/payment/[planId]/[interval]">) => {
  const { planId, interval } = await params;

  const isValid = Object.values(SubscriptionPlan).includes(planId as SubscriptionPlan) && planId !== SubscriptionPlan.FREE && planId !== SubscriptionPlan.EXPIRED && Object.values(BillingInterval).includes(interval as BillingInterval);

  if (!isValid) {
    redirect("/dashboard/plan", RedirectType.replace);
  }

  return <PaymentForm interval={interval as BillingInterval} />;
};

export default Payment;
