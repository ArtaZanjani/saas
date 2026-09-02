import type { Metadata } from "next";
import DeleteProduct from "@/components/DeleteProduct";
import Indicator from "@/components/Indicator";
import NewProduct from "@/components/organisms/NewProduct";
import { buttonVariants } from "@/components/ui/button";
import requireAuth from "@/lib/requireAuth";
import { Edit2, Add, Box } from "iconsax-reactjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مدیریت محصولات | سفارش‌یار",
};

const Products = async ({ searchParams }: PageProps<"/dashboard/products">) => {
  const auth = await requireAuth({
    role: "USER",
    redirectOnForbidden: true,
  });

  const { editProduct } = await searchParams;

  const product = auth.user.products.find((e) => e.id === editProduct);

  return (
    <>
      <div className="w-full rounded-4xl p-3 bg-card space-y-6">
        <div className="w-full flex items-center">
          <Indicator title="مدیریت محصولات" />

          {!!auth.user.products.length && (
            <Link className={buttonVariants({ className: "mr-auto" })} href="?newProduct=true">
              <Add className="size-6" />
              افزودن محصول جدید
            </Link>
          )}
        </div>

        {auth.user.products.length ? (
          <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(305.33px,1fr))] gap-3 md:gap-5">
            {auth.user.products.map((e, index) => (
              <div className="w-full h-14 bg-muted dark:bg-background rounded-3xl px-3 pr-4 flex items-center justify-between gap-x-2" key={index}>
                <p className="min-w-0 flex-1 truncate">{e.productName}</p>

                <div className="flex items-center gap-x-1">
                  <Link className={buttonVariants({ size: "icon-sm", variant: "ghost" })} href={`?editProduct=${e.id}`} aria-label={`ویرایش ${e.productName}`}>
                    <Edit2 />
                  </Link>

                  <DeleteProduct id={e.id} ariaLabel={`حذف ${e.productName}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center pb-3">
            <div className="size-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
              <Box size="22" variant="Outline" className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">هنوز محصولی ثبت نشده</p>
            <p className="text-xs text-foreground mt-1">اولین محصول خود را همین الان ثبت کنید.</p>
            <Link className={buttonVariants({ className: "mt-4" })} href="?newProduct=true" scroll={false}>
              محصول جدید
            </Link>
          </div>
        )}
      </div>
      <NewProduct {...(product ? { ...product, price: String(product.price) } : undefined)} />
    </>
  );
};

export default Products;
