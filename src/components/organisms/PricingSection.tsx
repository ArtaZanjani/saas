"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/utils/function";
import { SubscriptionPlan } from "@/generated/prisma/enums";
import { BillingInterval } from "@/generated/prisma/enums";
import { StarIcon } from "lucide-react";
import { plans, billingFrequencies, discountPercent } from "@/lib/pricing";
import { MAX_FREE_ORDER } from "@/lib/constants";

export const PricingSection = ({
  subscriptionPlan,
}: {
  subscriptionPlan: SubscriptionPlan;
}) => {
  const [interval, setInterval] = useState<BillingInterval>(
    BillingInterval.MONTHLY,
  );

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-7">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1 p-1 bg-card rounded-full">
          {billingFrequencies.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setInterval(item.id)}
              className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${interval === item.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {interval === item.id && (
                <motion.div
                  layoutId="billingToggle"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    mass: 0.8,
                  }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex-1 flex justify-center max-md:flex-col max-md:items-center gap-6">
        {plans.map((plan) => {
          const calculatedPrice =
            interval === "YEARLY" && plan.price > 0
              ? Math.round(plan.price * (1 - discountPercent / 100))
              : plan.price;
          const isActivePlan = plan.id === subscriptionPlan;
          const isDisabled = isActivePlan || plan.id === SubscriptionPlan.FREE;

          return (
            <div
              className="relative flex w-full flex-col overflow-hidden rounded-4xl bg-card p-4 max-w-117"
              key={plan.name}
            >
              <div className="min-h-37.5">
                <AnimatePresence mode="wait">
                  <div className="absolute top-4 inset-e-4 z-10 flex items-center gap-2">
                    {plan.id === "PRO" && (
                      <motion.div
                        className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs"
                        key="popular-badge"
                        layout
                        transition={{ duration: 0.1 }}
                      >
                        <StarIcon className="size-3 fill-current" />
                        محبوب
                      </motion.div>
                    )}

                    {interval === "YEARLY" && plan.price > 0 && (
                      <motion.div
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 rounded-md border bg-primary px-2 py-0.5 text-primary-foreground text-xs"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        key="discount-badge"
                        layout
                        transition={{ duration: 0.15 }}
                      >
                        {toPersianDigits(discountPercent)}٪ تخفیف
                      </motion.div>
                    )}
                  </div>
                </AnimatePresence>

                <div className="font-medium text-lg">{plan.name}</div>
                <div className="mt-6 mb-1 flex w-max items-center gap-1">
                  <>
                    <span className="font-extrabold text-3xl">
                      {calculatedPrice > 0
                        ? calculatedPrice.toLocaleString("fa-IR")
                        : "۰"}
                    </span>
                    <span>تومان/ماه</span>
                  </>
                </div>
                <p className="mb-2 font-normal text-muted-foreground text-xs">
                  {calculatedPrice > 0
                    ? `صورتحساب ${interval === "MONTHLY" ? "ماهانه" : "سالانه"}`
                    : `تا ${toPersianDigits(MAX_FREE_ORDER)} سفارش در ماه`}
                </p>
              </div>

              <Button
                disabled={isDisabled}
                className="w-full h-11"
                variant={
                  plan.id === SubscriptionPlan.PRO ? "default" : "outline"
                }
                nativeButton={isDisabled}
                render={
                  isDisabled ? undefined : (
                    <Link href={`/dashboard/payment/${plan.id}/${interval}`} />
                  )
                }
              >
                {isActivePlan ? "اشتراک فعلی" : plan.btn}
              </Button>

              <div className="space-y-3 pt-6 pb-8 text-muted-foreground text-sm">
                {plan.features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div className="flex items-center gap-2" key={feature.text}>
                      <Icon className="size-4" variant="Bold" />
                      <p>{feature.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
