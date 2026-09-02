import type { Metadata } from "next";
import PageHeader from "@/components/atoms/PageHeader";
import { PricingSection } from "@/components/organisms/PricingSection";
import requireAuth from "@/lib/requireAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خرید اشتراک | سفارش‌یار",
};

const PlanPage = async () => {
  const auth = await requireAuth({
    role: "USER",
    redirectOnForbidden: true,
  });

  return (
    <>
      <PageHeader title="اشتراک" description="برنامه مناسب کسب‌وکار خود را انتخاب کنید" />
      <PricingSection subscriptionPlan={auth.user.store.subscriptionPlan} />
    </>
  );
};

export default PlanPage;
