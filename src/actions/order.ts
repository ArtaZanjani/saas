"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/generated/prisma/enums";
import { getNextStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import newOrderSchema from "@/validation/newOrder.schema";
import { MAX_FREE_ORDER, ORDER_STATUSES } from "@/lib/constants";
import { handleCatch } from "@/utils/function";
import { orderEventBus } from "@/lib/sse";
import { orderItemsSchema } from "@/validation/orderItems.schema";
import requireAuth from "@/lib/requireAuth";

const requireString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${key} is required`);
  }

  return value.trim();
};

export const createOrder = async ({
  userName,
  phoneNumber,
  address,
  productIds,
}: {
  userName: string;
  phoneNumber: string;
  address: string;
  productIds: string[];
}) => {
  let orderId: string;

  try {
    const auth = await requireAuth({ role: "USER" });

    if (auth.user.store.subscriptionPlan === "EXPIRED")
      throw {
        message: "اشتراک شما منقضی شده است. لطفاً اشتراک خود را تمدید کنید",
        status: 403,
      };

    if (
      auth.user.store.subscriptionPlan === "FREE" &&
      auth.user.store._count.orders >= MAX_FREE_ORDER
    ) {
      throw {
        message: "تعداد سفارش‌های پلن رایگان شما به حد مجاز رسیده است",
        status: 403,
      };
    }
    const parsed = newOrderSchema.parse({
      userName,
      phoneNumber,
      address,
      productIds,
    });

    const ownedProducts = auth.user.products.filter((p) =>
      parsed.productIds.includes(p.id),
    );

    if (ownedProducts.length !== parsed.productIds.length)
      throw { message: "یک یا چند محصول انتخاب‌شده معتبر نیست", status: 400 };

    const items = orderItemsSchema.parse(
      ownedProducts.map((p) => ({
        productName: p.productName,
        price: p.price,
      })),
    );

    const order = await prisma.order.create({
      data: {
        userName,
        phoneNumber,
        storeId: auth.user.storeId,
        status: "NEW",
        products: items,
        address,
      },
    });

    orderId = order.id;
  } catch (error) {
    return handleCatch(error);
  }

  redirect(`/dashboard?order=${orderId}`);
};

export const advanceOrderStatus = async (
  formData: FormData,
): Promise<{ status: number; message?: string }> => {
  try {
    const orderId = requireString(formData, "orderId");

    const auth = await requireAuth({ role: "USER" });

    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId: auth.user.storeId },
      select: { status: true },
    });

    if (!order) throw { message: "سفارش یافت نشد", status: 404 };

    const nextStatus = getNextStatus(order.status);

    if (!nextStatus)
      throw { message: "وضعیت فعلی قابل تغییر نیست", status: 400 };

    const rows = await prisma.$queryRaw<{ updatedAt: Date }[]>`
    UPDATE "Order"
    SET status = ${nextStatus}::"OrderStatus", "updatedAt" = NOW()
    WHERE id = ${orderId}
      AND "storeId" = ${auth.user.storeId}
      AND status = ${order.status}::"OrderStatus"
    RETURNING "updatedAt"
  `;

    if (rows.length === 0)
      throw {
        message: "تغییر وضعیت اعمال نشد (احتمال تغییر همزمان)",
        status: 409,
      };

    orderEventBus.emit(orderId, nextStatus, rows[0].updatedAt.toISOString());

    revalidatePath("/dashboard");

    return { message: "وضعیت سفارش تغییر کرد", status: 200 };
  } catch (error) {
    return handleCatch(error);
  }
};

/**
 * Sets an order to any valid status, regardless of current state.
 * This is an intentional admin override — the dashboard dropdown allows
 * setting any status (including backward transitions like DELIVERED → NEW)
 * for manual correction. advanceOrderStatus enforces forward-only progression.
 */
export const setOrderStatus = async (
  formData: FormData,
): Promise<{ status: number; message?: string }> => {
  try {
    const orderId = requireString(formData, "orderId");
    const rawStatus = requireString(formData, "status");

    if (!(ORDER_STATUSES as readonly string[]).includes(rawStatus))
      throw { status: 400, message: "وضعیت نامعتبر است" };

    const nextStatus = rawStatus as OrderStatus;

    const auth = await requireAuth({ role: "USER" });

    const rows = await prisma.$queryRaw<{ updatedAt: Date }[]>`
    UPDATE "Order"
    SET status = ${nextStatus}::"OrderStatus", "updatedAt" = NOW()
    WHERE id = ${orderId}
      AND "storeId" = ${auth.user.storeId}
    RETURNING "updatedAt"
  `;

    if (rows.length === 0) throw { status: 404, message: "سفارش یافت نشد" };

    orderEventBus.emit(orderId, nextStatus, rows[0].updatedAt.toISOString());

    revalidatePath("/dashboard");

    return {
      status: 200,
      message: "وضعیت سفارش تغییر کرد",
    };
  } catch (error) {
    return handleCatch(error);
  }
};
