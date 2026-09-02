"use client";

import { useEffect, useState, useRef } from "react";
import { TickCircle } from "iconsax-reactjs";
import { STATUS_LABELS, RECONNECT_INITIAL_MS, RECONNECT_MAX_MS, RECONNECT_MAX_RETRIES } from "@/lib/constants";
import { formatToman, formatDate } from "@/lib/format";
import { AnimatePresence, motion } from "motion/react";

// productName/price are derived server-side (joined names / summed price
// across the order's related Product rows) — not raw Order columns.
type OrderData = {
  id: string;
  productName: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  note: string | null;
  userName: string;
};

// Index 2 ("آماده‌سازی سفارش") has no dedicated status — it's a visual-only
// intermediate step between PAID and SHIPPED, so it's never "current" (pulsing).
const STATUS_INDEX: Record<string, number> = {
  NEW: 0,
  PAID: 1,
  SHIPPED: 3,
  DELIVERED: 4,
};

const STATUS_PROGRESS: Record<string, number> = {
  NEW: 0,
  PAID: 25,
  SHIPPED: 65,
  DELIVERED: 80,
};

function backoffDelay(attempt: number): number {
  const base = Math.min(RECONNECT_INITIAL_MS * 2 ** attempt, RECONNECT_MAX_MS);
  const jitter = base * 0.5 * Math.random();
  return base + jitter;
}

const OrderTimeline = ({ order: initial, token }: { order: OrderData; token: string }) => {
  const [order, setOrder] = useState(initial);
  const [tokenError, setTokenError] = useState(false);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    async function probeAndConnect() {
      if (cancelled) return;

      try {
        const res = await fetch(`/api/events/${initial.id}/check?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (res.status === 403) {
          setTokenError(true);
          return;
        }
      } catch {
        // network error — proceed with EventSource which handles reconnects
      }

      connect();
    }

    function connect() {
      if (cancelled) return;

      const es = new EventSource(`/api/events/${initial.id}?token=${encodeURIComponent(token)}`);
      esRef.current = es;

      es.onopen = () => {
        attempt = 0;
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "status_change") {
            setOrder((prev) => ({
              ...prev,
              status: data.status,
              updatedAt: new Date(data.updatedAt),
            }));
          }
        } catch {
          // malformed event, ignore
        }
      };

      es.onerror = () => {
        es.close();
        if (cancelled) return;

        if (attempt >= RECONNECT_MAX_RETRIES) return;
        const delay = backoffDelay(attempt);
        attempt++;
        reconnectRef.current = setTimeout(connect, delay);
      };
    }

    probeAndConnect();

    return () => {
      cancelled = true;
      esRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [initial.id, token]);

  const isPaid = order.status !== "NEW";
  const isDelivered = order.status === "DELIVERED";
  const isShipped = order.status === "SHIPPED" || isDelivered;
  const currentIndex = STATUS_INDEX[order.status] ?? 0;
  const updatedAt = formatDate(order.updatedAt);

  const orderTimeline = [
    {
      title: "در انتظار پرداخت",
      time: formatDate(order.createdAt),
      description: `ثبت سفارش توسط ${order.userName}`,
    },
    {
      title: "پرداخت شده",
      time: isPaid ? updatedAt : null,
      description: `مبلغ: ${formatToman(order.price)} تومان - ${order.productName}`,
    },
    {
      title: "آماده‌سازی سفارش",
      time: isShipped ? updatedAt : null,
      description: "سفارش در حال پردازش و آماده‌سازی است",
    },
    {
      title: "ارسال شده",
      time: isShipped ? updatedAt : null,
      description: order.note ? `یادداشت: ${order.note}` : "سفارش تحویل پست/پیک گردید",
    },
    {
      title: "تحویل داده شد",
      time: isDelivered ? updatedAt : null,
      description: "سفارش با موفقیت تحویل داده شد",
    },
  ];

  const progress = STATUS_PROGRESS[order.status] ?? 0;
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance lg:leading-[1.1] xl:text-4xl xl:tracking-tighter">سفارش {order.id.slice(-6).toUpperCase()}</h1>
        <p className="text-muted-foreground text-sm">{STATUS_LABELS[order.status]}</p>
      </div>

      <div className="bg-card ring-border/60 mt-8 rounded-3xl border p-7 ring-1 sm:p-8 z-10">
        <ol className="flex flex-col relative">
          {orderTimeline.map((item, index, arr) => {
            const isCompleted = isPaid && (isDelivered || index < currentIndex);
            const isCurrent = !isDelivered && index === currentIndex;
            const isPending = index > currentIndex;
            const showDetails = isCompleted || isCurrent;
            const isLast = index === arr.length - 1;

            return (
              <li key={index} className="relative flex gap-5 pb-8 last:pb-0">
                {!isLast && <span className="bg-border absolute top-7 inset-s-3.25 h-[calc(100%-1.75rem)] w-0.5" />}

                <div className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-500 z-20 ${isCompleted ? "bg-foreground text-card" : isCurrent ? "border-foreground bg-card border-2" : "border-border bg-card border"}`}>
                  <AnimatePresence initial={false}>
                    {isCurrent ? (
                      <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.2, duration: 0.3 } }} exit={{ opacity: 0, scale: 0 }} className="bg-foreground size-2 rounded-full animate-pulse" />
                    ) : isCompleted ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: index * 0.2, duration: 0.3 } }} exit={{ opacity: 0 }}>
                        <TickCircle variant="Bold" className="size-6" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className={isPending ? "text-muted-foreground text-sm font-semibold" : "text-foreground text-sm font-semibold"}>{item.title}</h2>

                  <p className="text-muted-foreground mt-0.5 text-sm text-pretty">{showDetails ? item.description : null}</p>
                </div>
              </li>
            );
          })}

          <div
            className="w-0.5 absolute top-0 inset-s-3.25 bg-foreground duration-1000 z-10"
            style={{
              height: `${progress}%`,
            }}
          ></div>
        </ol>
      </div>

      {tokenError && <p className="text-destructive mt-4 text-center text-xs font-medium">این لینک منقضی شده — لطفاً لینک جدید را از فروشنده درخواست کنید.</p>}
    </>
  );
};

export default OrderTimeline;
