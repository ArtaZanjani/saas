"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RevenueChartProps {
  data: { date: string; income: number }[];
}

const chartConfig = {
  income: {
    label: "درآمد",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

const ranges = [
  { value: "daily", shortLabel: "امروز", itemLabel: "امروز", days: 1 },
  { value: "weekly", shortLabel: "هفتگی", itemLabel: "هفته اخیر", days: 7 },
  { value: "30d", shortLabel: "۳۰ روزه", itemLabel: "۳۰ روز اخیر", days: 30 },
  { value: "6m", shortLabel: "۶ ماهه", itemLabel: "۶ ماه اخیر", days: 180 },
  { value: "1y", shortLabel: "۱ ساله", itemLabel: "سال اخیر", days: 365 },
  { value: "all", shortLabel: "کلی", itemLabel: "کل درآمد", days: null },
] as const;

type TimeRange = (typeof ranges)[number]["value"];

const RevenueChart = ({ data }: RevenueChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const latestDate = useMemo(() => (data.length > 0 ? new Date(data.at(-1)!.date) : new Date()), [data]);
  const activeRange = useMemo(() => ranges.find((r) => r.value === timeRange)!, [timeRange]);

  const filteredData = useMemo(() => {
    if (activeRange.days === null) return data;

    const startDate = new Date(latestDate);
    if (timeRange === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(startDate.getDate() - activeRange.days);
    }

    return data.filter((item) => new Date(item.date) >= startDate);
  }, [activeRange, latestDate, data, timeRange]);

  const formatDateTime = (value: unknown) => {
    if (value == null) return "";

    const dateObj = new Date(String(value));

    if (isNaN(dateObj.getTime())) return "";

    switch (timeRange) {
      case "daily":
        return dateObj.toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
        });

      case "weekly":
      case "30d":
        return dateObj.toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

      case "6m":
      case "1y":
        return dateObj.toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long",
        });

      case "all":
        return dateObj.toLocaleDateString("fa-IR", {
          year: "numeric",
        });

      default:
        return "";
    }
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <CardTitle className="flex-1">نمودار درآمد</CardTitle>

        <Select value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-30 md:w-40" aria-label="انتخاب بازه زمانی نمودار درآمد">
            <SelectValue placeholder="انتخاب بازه زمانی">{activeRange.shortLabel}</SelectValue>
          </SelectTrigger>

          <SelectContent>
            {ranges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.itemLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={(value) => formatDateTime(value)} />

            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(value) => formatDateTime(value)} formatter={(value) => <span>{Number(value).toLocaleString("fa-IR")} تومان</span>} hideIndicator />} />

            <Area dataKey="income" type="natural" fill="url(#fillDesktop)" stroke="var(--color-primary)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
