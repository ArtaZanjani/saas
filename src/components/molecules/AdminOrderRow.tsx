"use client";
import { motion } from "motion/react";
import { BillingInterval, PaymentStatus } from "@/generated/prisma/enums";
import { billingFrequencies } from "@/lib/pricing";
import { formatDate } from "@/lib/format";
import { CloseCircle, Eye, TickCircle } from "iconsax-reactjs";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { useTransition } from "react";
import { updatePaymentStatus } from "@/actions/payment";
import { toast } from "sonner";
import { adminFilters } from "@/lib/constants";

type Order = {
  id: string;
  storeId: string;
  src: string;
  interval: BillingInterval;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  index: number;
};

const AdminOrderRow = ({
  id,
  storeId,
  src,
  interval,
  paymentStatus,
  createdAt,
  index,
}: Order) => {
  const [isLoading, startTransition] = useTransition();

  const handlePaymentStatusUpdate = (
    paymentStatus: Exclude<PaymentStatus, "PENDING">,
  ) => {
    if (isLoading) return;
    startTransition(async () => {
      const res = await updatePaymentStatus({ id, storeId, paymentStatus });

      if (res.status === 200) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <motion.tr
      key={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.5,
        delay: index * 0.025,
      }}
      className="hover:bg-accent transition-colors group will-change-transform"
    >
      <td className="px-5 py-4 text-sm font-medium text-foreground">
        {storeId}
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-foreground">
        {billingFrequencies.find((item) => item.id === interval)?.label || ""}
      </td>

      <td className="px-5 py-4 text-xs text-foreground whitespace-nowrap">
        {adminFilters.find((e) => e.value === paymentStatus)?.label || ""}
      </td>

      <td className="px-5 py-4 text-xs text-foreground whitespace-nowrap">
        {formatDate(createdAt)}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          {!!src.length && (
            <Link
              href={src}
              target="_blank"
              className={buttonVariants({
                size: "icon",
                variant: "secondary",
                className: "active:scale-[0.95] whitespace-nowrap",
              })}
            >
              <Eye />
            </Link>
          )}

          <button
            className={buttonVariants({
              size: "icon",
              variant: "success",
              className: "active:scale-[0.95] whitespace-nowrap",
            })}
            disabled={isLoading || paymentStatus !== "PENDING"}
            onClick={() => handlePaymentStatusUpdate("ACCEPTED")}
          >
            <TickCircle />
          </button>

          <button
            className={buttonVariants({
              size: "icon",
              variant: "destructive",
              className: "active:scale-[0.95] whitespace-nowrap",
            })}
            disabled={isLoading || paymentStatus !== "PENDING"}
            onClick={() => handlePaymentStatusUpdate("DECLINED")}
          >
            <CloseCircle />
          </button>

          {/* <button
            onClick={handleAdvance}
            disabled={!nextStatus || isLoading}
            className="rounded-full bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-foreground/5 disabled:text-muted-foreground/60 active:scale-[0.95] whitespace-nowrap"
          >
            {isLoading ? "..." : (STATUS_ACTIONS[order.status] ?? order.status)}
          </button> */}
        </div>
        {/* {error && (
          <div className="text-[10px] text-destructive mt-1 text-center">
            {error}
          </div>
        )} */}
      </td>
    </motion.tr>
  );
};

export default AdminOrderRow;
