"use server";

import { handleCatch } from "@/utils/function";
import newProductSchema from "@/validation/newProduct.schema";
import { prisma } from "@/lib/prisma";
import { redirect, RedirectType } from "next/navigation";
import { revalidatePath } from "next/cache";
import requireAuth from "@/lib/requireAuth";

export const createProduct = async ({
  id,
  productName,
  price,
}: {
  id?: string;
  productName: string;
  price: string;
}) => {
  let redirectUrl;
  const isEditMode = id?.length;
  try {
    const auth = await requireAuth({ role: "USER" });

    if (auth.user.store.subscriptionPlan === "EXPIRED")
      throw {
        message: "اشتراک شما منقضی شده است. لطفاً اشتراک خود را تمدید کنید",
        status: 403,
      };

    const validatedData = newProductSchema.parse({ productName, price });

    if (isEditMode) {
      const { count } = await prisma.product.updateMany({
        where: { id, userId: auth.user.id },
        data: {
          productName: validatedData.productName,
          price: Number(validatedData.price),
        },
      });

      if (count === 0)
        throw { message: "محصول مورد نظر یافت نشد", status: 404 };
    } else {
      await prisma.product.create({
        data: {
          userId: auth.user.id,
          productName: validatedData.productName,
          price: Number(validatedData.price),
        },
      });
    }

    revalidatePath("/dashboard/products");

    redirectUrl = "/dashboard/products";
  } catch (error) {
    return handleCatch(error);
  }

  redirect(redirectUrl, RedirectType.replace);
};

export const deleteProduct = async ({ id }: { id: string }) => {
  try {
    const auth = await requireAuth({ role: "USER" });

    const ownsProduct = auth.user.products.some((product) => product.id === id);
    if (!ownsProduct) throw { message: "محصول مورد نظر یافت نشد", status: 404 };

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/dashboard/products");

    return { status: 200, message: "محصول با موفقیت حذف شد" };
  } catch (error) {
    return handleCatch(error);
  }
};
