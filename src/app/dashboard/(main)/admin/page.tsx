import type { Metadata } from "next";
import AdminOrderRow from "@/components/molecules/AdminOrderRow";
import FilterTabs from "@/components/molecules/FilterTabs";
import SearchInput from "@/components/molecules/SearchInput";
import { PaymentStatus } from "@/generated/prisma/enums";
import { adminFilters } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import requireAuth from "@/lib/requireAuth";
import { Box } from "iconsax-reactjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل ادمین | سفارش‌یار",
};

const Admin = async ({ searchParams }: PageProps<"/dashboard/admin">) => {
  await requireAuth({
    role: "ADMIN",
    redirectOnForbidden: true,
  });

  const { q, status } = await searchParams;

  const search = typeof q === "string" ? q : "";
  const isValidPaymentStatus = (value: string): value is PaymentStatus => {
    return Object.values(PaymentStatus).includes(value as PaymentStatus);
  };

  const activeStatus =
    typeof status === "string" && isValidPaymentStatus(status) ? status : "ALL";

  const payments = await prisma.payment.findMany({
    where: {
      ...(activeStatus !== "ALL" && {
        paymentStatus: activeStatus,
      }),

      ...(search && {
        storeId: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-y-6 mt-10">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row sm:items-center gap-3 sm:gap-4">
        <FilterTabs
          activeStatus={activeStatus}
          search={search}
          filters={adminFilters}
          isAdmin
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
                {["شناسه", "مدت", "وضعیت", "تاریخ ثبت", "عملیات"].map(
                  (e, index) => (
                    <th
                      className="px-5 py-3.5 text-xs font-semibold text-muted-foreground tracking-wide last:text-center"
                      key={index}
                    >
                      {e}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5 dark:divide-foreground/10">
              {payments.map((e, index) => (
                <AdminOrderRow {...e} index={index} key={index} />
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="size-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
              <Box
                size="22"
                variant="Outline"
                className="text-muted-foreground"
              />
            </div>
            {payments.length === 0 ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  هنوز سفارشی ثبت نشده
                </p>
                <p className="text-xs text-foreground mt-1">
                  اولین سفارش خود را همین الان ثبت کنید.
                </p>
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
  );
};

export default Admin;
