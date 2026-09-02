import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyTrackingToken } from "@/utils/tracking";
import { orderItemsSchema } from "@/validation/orderItems.schema";
import OrderTimeline from "@/components/molecules/OrderTimeline";

export const metadata: Metadata = {
  title: "پیگیری سفارش | سفارش‌یار",
  description:
    "پیگیری وضعیت سفارش و مشاهده تاریخچه خرید در سفارش‌یار. ردیابی لحظه‌ای سفارح در فروشگاه اینستاگرامی شما.",
  keywords: [
    "پیگیری سفارش",
    "ردیابی سفارش",
    "وضعیت سفارش",
    "تاریخچه خرید",
    "سفارش یار",
    "پیگیری سفارش اینستاگرام",
    "فروشگاه آنلاین",
    "پیگیری کالا",
    "وضعیت تحویل سفارش",
    "سابقه خرید",
  ],
  alternates: {
    languages: {
      fa: "https://sefarat-yar.com/track",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "پیگیری سفارش | سفارش‌یار",
    description: "پیگیری وضعیت سفارش و مشاهده تاریخچه خرید در سفارش‌یار.",
    type: "website",
    url: "https://sefarat-yar.com/track",
    locale: "fa_IR",
    siteName: "سفارش‌یار",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "سفارش‌یار - پیگیری سفارش",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "پیگیری سفارش | سفارش‌یار",
    description: "پیگیری وضعیت سفارش و مشاهده تاریخچه خرید در سفارش‌یار.",
    images: ["/icons/icon-512x512.png"],
  },
};

export const dynamic = "force-dynamic";

const TrackOrderPage = async ({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ token?: string }> }) => {
  const { orderId } = await params;
  const { token } = await searchParams;

  if (!token || !verifyTrackingToken(orderId, token)) {
    notFound();
  }

  const rawOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      note: true,
      userName: true,
      phoneNumber: true,
      products: true,
    },
  });

  if (!rawOrder) notFound();

  const items = orderItemsSchema.parse(rawOrder.products);

  const order = {
    ...rawOrder,
    productName: items.map((p) => p.productName).join("، "),
    price: items.reduce((sum, p) => sum + p.price, 0),
  };

  return (
    <div className="w-full h-dvh flex justify-center items-center">
      <div className="mx-auto w-full max-w-2xl px-4">
        <OrderTimeline order={order} token={token} />
        <p className="text-muted-foreground mt-4 text-center text-xs">این صفحه به‌روزرسانی خودکار دارد و نیازی به رفرش نیست.</p>
      </div>
    </div>
  );
};

export default TrackOrderPage;
