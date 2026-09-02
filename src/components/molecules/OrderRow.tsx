"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { advanceOrderStatus } from "@/actions/order";
import { STATUS_LABELS, STATUS_ACTIONS, STATUS_TONES, STATUS_FLOW } from "@/lib/constants";
import { formatToman, formatDate } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  productName: string;
  price: number;
  createdAt: Date;
  userName: string;
  phoneNumber: string;
};

const OrderRow = ({ order, index, search, status, remainingCount }: { order: Order; index: number; search: string; status?: string; remainingCount: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const nextStatus = STATUS_FLOW[order.status];

  const viewParams = new URLSearchParams();
  viewParams.set("order", order.id);
  if (search) viewParams.set("q", search);
  if (status && status !== "ALL") viewParams.set("status", status);
  const viewOrderHref = `?${viewParams.toString()}`;

  const handleAdvance = useCallback(() => {
    if (!nextStatus) return;
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("orderId", order.id);
        const result = await advanceOrderStatus(formData);

        if (result.status !== 200) {
          setError(result.message ?? "خطا در تغییر وضعیت");
          return;
        }
        const params = new URLSearchParams(searchParams.toString());
        params.delete("order");
        params.delete("history");
        const isLastInCategory = remainingCount <= 1 && status && status !== "ALL";
        if (!status || status === "ALL" || isLastInCategory) {
          params.set("status", nextStatus);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } catch {
        setError("خطا در تغییر وضعیت");
      }
    });
  }, [order.id, nextStatus, remainingCount, status, router, pathname, searchParams]);

  return (
    <motion.tr key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5, delay: index * 0.025 }} className="hover:bg-accent transition-colors group will-change-transform">
      <td className="px-5 py-4 text-foreground">
        <div className="font-semibold text-sm">{order.userName}</div>
        <div className="text-xs mt-0.5 text-foreground" dir="ltr">
          {order.phoneNumber}
        </div>
      </td>
      <td className="px-5 py-4 text-sm font-medium text-foreground">{order.productName}</td>
      <td className="px-5 py-4 text-sm font-semibold text-foreground">
        {formatToman(order.price)} <span className="text-xs text-foreground font-normal">تومان</span>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${STATUS_TONES[order.status]}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
      </td>
      <td className="px-5 py-4 text-xs text-foreground whitespace-nowrap">{formatDate(order.createdAt)}</td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <Link href={viewOrderHref} scroll={false} aria-label={`مشاهده سفارش ${order.id.slice(-6).toUpperCase()}`} className="rounded-full border border-foreground/8 bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-secondary transition active:scale-[0.95] whitespace-nowrap">
            مشاهده
          </Link>

          <button onClick={handleAdvance} disabled={!nextStatus || isLoading} className="rounded-full bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:bg-foreground/5 disabled:text-muted-foreground/60 active:scale-[0.95] whitespace-nowrap">
            {isLoading ? "..." : (STATUS_ACTIONS[order.status] ?? order.status)}
          </button>
        </div>
        {error && <div className="text-[10px] text-destructive mt-1 text-center">{error}</div>}
      </td>
    </motion.tr>
  );
};

export default OrderRow;
