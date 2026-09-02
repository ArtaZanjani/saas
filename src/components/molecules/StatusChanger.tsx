"use client";

import { motion } from "motion/react";
import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setOrderStatus } from "@/actions/order";
import { STATUS_LABELS } from "@/lib/constants";
import Spinner from "@/components/ui/spinner";

const statusOptions = Object.entries(STATUS_LABELS);

const StatusChanger = ({ orderId, currentStatus, remainingCount }: { orderId: string; currentStatus: string; remainingCount: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const handleChange = useCallback(
    (value: string | null) => {
      const selectedValue = value ?? "";
      if (!selectedValue || selectedValue === localStatus) return;

      setError(null);
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.set("orderId", orderId);
          formData.set("status", selectedValue);
          const result = await setOrderStatus(formData);

          if (result.status !== 200) {
            setError(result.message ?? "خطا در تغییر وضعیت");
            return;
          }

          setLocalStatus(selectedValue);

          const params = new URLSearchParams(searchParams.toString());
          params.delete("order");
          params.delete("history");

          const currentFilter = searchParams.get("status");
          const isLastInCategory = remainingCount <= 1 && currentFilter && currentFilter !== "ALL";

          if (!currentFilter || currentFilter === "ALL" || isLastInCategory) {
            params.set("status", selectedValue);
          }

          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        } catch {
          setError("خطا در تغییر وضعیت");
        }
      });
    },
    [orderId, localStatus, router, pathname, searchParams, remainingCount],
  );

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2 items-end">
        <div className="w-full gap-x-2 flex items-center">
          <Select value={localStatus} onValueChange={handleChange} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="تغییر وضعیت">{STATUS_LABELS[localStatus] || "انتخاب وضعیت"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isLoading && <Spinner className="size-5" />}
        </div>
      </div>
      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 text-[11px] text-destructive">
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default StatusChanger;
