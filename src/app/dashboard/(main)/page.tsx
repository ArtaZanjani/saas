import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardData, parseOrderStatus } from "@/lib/orders";
import { formatToman } from "@/lib/format";
import FilterTabs from "@/components/molecules/FilterTabs";
import AnimatedPopup from "@/components/organisms/AnimatedPopup";
import SearchInput from "@/components/molecules/SearchInput";
import OrderRow from "@/components/molecules/OrderRow";
import StatusChanger from "@/components/molecules/StatusChanger";
import HistoryList from "@/components/molecules/HistoryList";
import { Box, DocumentDownload } from "iconsax-reactjs";
import { buttonVariants } from "@/components/ui/button";
import RevenueChart from "@/components/overview/RevenueChart";
import StatsCards from "@/components/overview/StatsCards";
import CopyLinkButton from "@/components/molecules/CopyLinkButton";
import { generateTrackingToken } from "@/utils/tracking";
import requireAuth from "@/lib/requireAuth";
import { filters } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سفارش‌ها | سفارش‌یار",
};

const Home = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const auth = await requireAuth({
    role: "USER",
    redirectOnForbidden: true,
  });

  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusParam =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const selectedOrderId =
    typeof searchParams.order === "string" ? searchParams.order : undefined;
  const addressParam =
    typeof searchParams.address === "string" ? searchParams.address : undefined;
  const activeStatus = parseOrderStatus(statusParam);
  const { orders, selectedOrder, stats, chartData } = await getDashboardData(
    auth.user.storeId,
    search,
    activeStatus,
    selectedOrderId,
  );

  return (
    <>
      <StatsCards
        todaySales={stats.todaySales}
        totalOrders={stats.totalOrders}
        pendingOrders={stats.pendingOrders}
        totalRevenue={stats.totalRevenue}
      />
      <RevenueChart data={chartData} />

      <div className="flex flex-col gap-y-6 mt-10">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row sm:items-center gap-3 sm:gap-4">
          <FilterTabs
            activeStatus={activeStatus ?? "ALL"}
            search={search}
            filters={filters}
          />

          <div className="max-md:w-full md:ms-auto">
            <SearchInput defaultValue={search} />
          </div>
        </div>
        {/* Table */}
        <div className="overflow-hidden rounded-4xl ring-1 ring-foreground/5 dark:ring-foreground/10 bg-card">
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-175 text-sm text-foreground text-right"
              aria-label="لیست سفارشات"
            >
              <thead>
                <tr className="border-b border-foreground/5 dark:border-foreground/10">
                  {[
                    "مشتری",
                    "محصول",
                    "مبلغ",
                    "وضعیت",
                    "تاریخ ثبت",
                    "عملیات",
                  ].map((e, index) => (
                    <th
                      className="px-5 py-3.5 text-xs font-semibold text-muted-foreground tracking-wide last:text-center"
                      key={index}
                    >
                      {e}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 dark:divide-foreground/10">
                {orders.map((order, index) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    index={index}
                    search={search}
                    status={statusParam}
                    remainingCount={orders.length}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="size-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
                <Box
                  size="22"
                  variant="Outline"
                  className="text-muted-foreground"
                />
              </div>
              {stats.totalOrders === 0 ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    هنوز سفارشی ثبت نشده
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    اولین سفارش خود را همین الان ثبت کنید.
                  </p>
                  <Link
                    className={buttonVariants({ className: "mt-4" })}
                    href="?new=true"
                    scroll={false}
                  >
                    سفارش جدید
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    سفارشی پیدا نشد
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    هیچ سفارشی با این فیلتر مطابقت ندارد.
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatedPopup triggerKey="order" title="مدیریت سفارش">
        {selectedOrder ? (
          <div className="text-sm space-y-4">
            <div className="rounded-3xl bg-muted p-4 space-y-3">
              <div className="grid gap-2.5 text-foreground">
                <Detail
                  label="کد پیگیری"
                  value={selectedOrder.id.slice(-6).toUpperCase()}
                />
                <Detail label="مشتری" value={selectedOrder.userName} />
                <Detail label="محصول" value={selectedOrder.productName} />
                <Detail
                  label="آدرس"
                  value={selectedOrder.address}
                  searchParams={searchParams}
                />
                <Detail
                  label="مبلغ نهایی"
                  value={`${formatToman(selectedOrder.price)} تومان`}
                />
              </div>
            </div>

            <StatusChanger
              orderId={selectedOrder.id}
              currentStatus={selectedOrder.status}
              remainingCount={orders.length}
            />

            <div className="flex items-center w-full gap-x-1">
              <Link
                className={buttonVariants({
                  className: "flex-1 min-w-0",
                  size: "lg",
                  variant: "default",
                })}
                href={`?order=${selectedOrder.id}${search ? `&q=${encodeURIComponent(search)}` : ""}${statusParam && statusParam !== "ALL" ? `&status=${statusParam}` : ""}&history=1`}
                scroll={false}
              >
                تاریخچه خریدهای{" "}
                <span className="truncate min-w-0 max-w-[50%] break-all">
                  {selectedOrder.userName}
                </span>
              </Link>

              <CopyLinkButton
                orderId={selectedOrder.id}
                token={generateTrackingToken(selectedOrder.id)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
              <DocumentDownload
                size="20"
                variant="Outline"
                className="text-muted-foreground"
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              در حال دریافت اطلاعات...
            </p>
          </div>
        )}
      </AnimatedPopup>
      <AnimatedPopup
        triggerKey="history"
        title={`تاریخچه خریدهای ${selectedOrder?.userName ?? ""}`}
      >
        {selectedOrder?.customerOrders ? (
          <HistoryList orders={selectedOrder.customerOrders} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              در حال دریافت اطلاعات...
            </p>
          </div>
        )}
      </AnimatedPopup>
      <AnimatedPopup triggerKey="address" title="آدرس سفارش">
        {addressParam ? (
          <div className="text-sm space-y-4">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-foreground wrap-break-word">{addressParam}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
              <DocumentDownload
                size="20"
                variant="Outline"
                className="text-muted-foreground"
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              در حال دریافت اطلاعات...
            </p>
          </div>
        )}
      </AnimatedPopup>
    </>
  );
};

const Detail = ({
  label,
  value,
  searchParams,
}: {
  label: string;
  value: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const buildAddressHref = () => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams ?? {})) {
      if (typeof val === "string") {
        params.set(key, val);
      }
    }
    params.set("address", value);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between gap-x-3 text-foreground">
      <span className="shrink-0 text-xs">{label}</span>

      {label === "آدرس" ? (
        <Link
          className={buttonVariants({
            variant: "outline",
            size: "xs",
            className: "border-border! -translate-x-0.5",
          })}
          href={buildAddressHref()}
          scroll={false}
        >
          مشاهده
        </Link>
      ) : (
        <span className="min-w-0 max-w-60 line-clamp-1 font-semibold text-sm break-all">
          {value}
        </span>
      )}
    </div>
  );
};

export default Home;
