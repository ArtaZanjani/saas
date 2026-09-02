import { unstable_noStore as noStore } from "next/cache";
import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "./prisma";
import { STATUS_FLOW, ORDER_STATUSES } from "./constants";
import { toEnglishDigits, toPersianDigits } from "@/utils/function";
import { formatPhone } from "@/utils/format";
import {
  orderItemsSchema,
  type OrderItem,
} from "@/validation/orderItems.schema";

const ORDER_PAGE_SIZE = 50;

const orderSelect = {
  id: true,
  status: true,
  createdAt: true,
  userName: true,
  phoneNumber: true,
  products: true,
  address: true,
} as const;

export const getNextStatus = (status: OrderStatus) => {
  return STATUS_FLOW[status] as OrderStatus | null;
};

export const parseOrderStatus = (value?: string) => {
  if (!value || value === "ALL") return undefined;
  if ((ORDER_STATUSES as readonly string[]).includes(value))
    return value as OrderStatus;
  return undefined;
};

const toPersian = <T extends string>(value: T | null): string => {
  return value ? toPersianDigits(value) : "";
};

const parseProducts = (products: unknown): OrderItem[] =>
  orderItemsSchema.parse(products);

const sumProductsPrice = (products: OrderItem[]) =>
  products.reduce((sum, p) => sum + p.price, 0);

const joinProductNames = (products: OrderItem[]) =>
  products.map((p) => p.productName).join("، ");

export const getDashboardData = async (
  storeId: string,
  search?: string,
  status?: OrderStatus,
  selectedOrderId?: string,
) => {
  noStore();

  const normalizedSearch = search?.trim()
    ? toEnglishDigits(search.trim())
    : undefined;

  const matchedOrderIds = normalizedSearch
    ? (
        await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Order"
          WHERE "storeId" = ${storeId}
          AND (
            id ILIKE ${`%${normalizedSearch}%`}
            OR "userName" ILIKE ${`%${normalizedSearch}%`}
            OR "phoneNumber" ILIKE ${`%${normalizedSearch}%`}
            OR EXISTS (
              SELECT 1 FROM jsonb_array_elements(products) AS item
              WHERE item->>'productName' ILIKE ${`%${normalizedSearch}%`}
            )
          )
        `
      ).map((r) => r.id)
    : null;

  const where = {
    storeId,
    ...(status ? { status } : {}),
    ...(matchedOrderIds ? { id: { in: matchedOrderIds } } : {}),
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [rawOrders, counts, rawSelectedOrder, todaySales, revenueOrders] =
    await Promise.all([
      prisma.order.findMany({
        where,
        select: orderSelect,
        orderBy: { createdAt: "desc" },
        take: ORDER_PAGE_SIZE,
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { storeId },
        _count: true,
      }),
      selectedOrderId
        ? prisma.order.findFirst({
            where: { id: selectedOrderId, storeId },
            select: orderSelect,
          })
        : null,
      prisma.order.count({
        where: { storeId, createdAt: { gte: todayStart } },
      }),
      prisma.order.findMany({
        where: { storeId },
        select: { createdAt: true, products: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  const orders = rawOrders.map((o) => {
    const items = parseProducts(o.products);
    return {
      ...o,
      productName: toPersianDigits(joinProductNames(items)),
      price: sumProductsPrice(items),
      userName: toPersianDigits(o.userName),
      phoneNumber: toPersian(formatPhone(o.phoneNumber)),
    };
  });

  const rawCustomerOrders = rawSelectedOrder
    ? await prisma.order.findMany({
        where: { storeId, phoneNumber: rawSelectedOrder.phoneNumber },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, status: true, createdAt: true, products: true },
      })
    : [];

  const selectedOrder = rawSelectedOrder
    ? (() => {
        const items = parseProducts(rawSelectedOrder.products);
        return {
          ...rawSelectedOrder,
          productName: toPersianDigits(joinProductNames(items)),
          price: sumProductsPrice(items),
          userName: toPersianDigits(rawSelectedOrder.userName),
          phoneNumber: toPersian(formatPhone(rawSelectedOrder.phoneNumber)),
          address: toPersian(rawSelectedOrder.address),
          customerOrders: rawCustomerOrders.map((o) => {
            const customerItems = parseProducts(o.products);
            return {
              ...o,
              productName: toPersianDigits(joinProductNames(customerItems)),
              price: sumProductsPrice(customerItems),
            };
          }),
        };
      })()
    : null;

  const revenueMap = new Map<string, { date: string; income: number }>();
  let totalRevenue = 0;
  for (const r of revenueOrders) {
    const orderPrice = sumProductsPrice(parseProducts(r.products));
    totalRevenue += orderPrice;
    const key = r.createdAt.toISOString();
    const existing = revenueMap.get(key);
    if (existing) {
      existing.income += orderPrice;
    } else {
      revenueMap.set(key, { date: key, income: orderPrice });
    }
  }
  const chartData = Array.from(revenueMap.values());

  return {
    orders,
    counts,
    selectedOrder,
    stats: {
      todaySales,
      totalOrders: counts.reduce((acc, c) => acc + c._count, 0),
      pendingOrders: counts.find((c) => c.status === "NEW")?._count ?? 0,
      totalRevenue,
    },
    chartData,
  };
};
