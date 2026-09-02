export const ORDER_STATUSES = ["NEW", "PAID", "SHIPPED", "DELIVERED"] as const;

export const STATUS_LABELS: Record<string, string> = {
  NEW: "جدید",
  PAID: "پرداخت شده",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
};

export const STATUS_ACTIONS: Record<string, string> = {
  NEW: "پرداخت شد",
  PAID: "ارسال شد",
  SHIPPED: "تحویل شد",
  DELIVERED: "کامل شده",
};

export const STATUS_TONES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  SHIPPED:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  DELIVERED:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
};

export const STATUS_FLOW: Record<string, string | null> = {
  NEW: "PAID",
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
};

export const filters = [
  { label: "همه", value: "ALL" },
  { label: "جدید", value: "NEW" },
  { label: "پرداخت شده", value: "PAID" },
  { label: "ارسال شده", value: "SHIPPED" },
  { label: "تحویل شده", value: "DELIVERED" },
];

export const adminFilters = [
  { label: "همه", value: "ALL" },
  { label: "در انتظار بررسی", value: "PENDING" },
  { label: "تایید شده", value: "ACCEPTED" },
  { label: "رد شده", value: "DECLINED" },
];

export const SSE_MAX_LISTENERS_PER_ORDER = 50;
// Per-process cap. In multi-instance deployments, effective global cap = this × instance count.
export const SSE_MAX_TOTAL_LISTENERS = 2_000;
export const SSE_STALE_THRESHOLD_MS = 60 * 60 * 1000;
export const SSE_SWEEP_INTERVAL_MS = 60_000;

export const RECONNECT_INITIAL_MS = 1_000;
export const RECONNECT_MAX_MS = 30_000;
export const RECONNECT_MAX_RETRIES = 15;

export const MAX_FREE_ORDER = 15;
