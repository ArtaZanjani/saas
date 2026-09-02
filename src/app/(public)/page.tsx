import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { publicUrls } from "@/utils/routes";

export const metadata: Metadata = {
  title: "سفارش‌یار | مدیریت سفارشات اینستاگرامی",
  description:
    "سفارش‌یار راهکاری ساده و قدرتمند برای مدیریت سفارشات، مشتریان و افزایش فروش فروشندگان اینستاگرامی. جایگزین اکسل و دایرکت برای مدیریت حرفه‌ای سفارش‌های فروشگاه آنلاین شما.",
  keywords: [
    "مدیریت سفارشات اینستاگرامی",
    "سفارش یار",
    "فروش اینستاگرام",
    "مدیریت فروش اینستاگرامی",
    "اکسل اینستاگرام",
    "دایرکت اینستاگرام",
    "فروشگاه آنلاین",
    "مدیریت سفارش",
    "اپلیکیشن فروش",
    "ردیابی سفارش",
    "صفحه پرداخت اینستاگرام",
    "فروشنده اینستاگرامی",
  ],
  alternates: {
    languages: {
      fa: "https://sefarat-yar.com",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "سفارش‌یار | مدیریت سفارشات اینستاگرامی",
    description:
      "سفارش‌یار راهکاری ساده و قدرتمند برای مدیریت سفارشات، مشتریان و افزایش فروش فروشندگان اینستاگرامی.",
    type: "website",
    url: "https://sefarat-yar.com",
    locale: "fa_IR",
    siteName: "سفارش‌یار",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "سفارش‌یار - مدیریت سفارشات اینستاگرامی",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "سفارش‌یار | مدیریت سفارشات اینستاگرامی",
    description:
      "سفارش‌یار راهکاری ساده و قدرتمند برای مدیریت سفارشات، مشتریان و افزایش فروش فروشندگان اینستاگرامی.",
    images: ["/icons/icon-512x512.png"],
  },
};

const font = IBM_Plex_Sans_Arabic({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const Home = () => {
  return (
    <>
      <header className="w-[95%] max-w-160 py-3.5 bg-card mx-auto sticky top-5 rounded-full flex items-center px-4 z-40">
        <Link className="size-7 block relative" href="/">
          <Image
            className="object-contain"
            src="/Logo.png"
            alt="لوگو"
            fill
            sizes="100%"
          />
        </Link>
        <nav className="ms-5">
          <ul className="flex items-center gap-x-4">
            {publicUrls.map((e) => (
              <li
                className="text-sm hover:text-foreground font-medium"
                key={e.path}
              >
                <Link href={e.path}>{e.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="?login=true"
          className={buttonVariants({
            className: "mr-auto active:translate-y-0!",
          })}
        >
          ورود / ثبت نام
        </Link>
      </header>

      <div
        className={`paddingBody flex flex-col items-center mt-25 ${font.className}`}
      >
        <Image
          src="/icons/icon-512x512.png"
          alt="لوگو"
          className="rounded-4xl overflow-hidden"
          width={90}
          height={90}
          priority
          quality={100}
        />

        <h1 className="text-5xl sm:text-6xl font-bold mt-8">سفارش یار</h1>

        <p className="max-[416px]:text-sm sm:text-lg text-center mt-8">
          یک راهکار ساده برای مدیریت سفارش‌ها، مشتریان و فروش بیشتر؛ <br /> بدون
          پیچیدگی‌های اضافی.
        </p>

        <Link
          className={buttonVariants({ className: "h-10 gap-x-3 mt-6" })}
          href="?login=true"
        >
          رایگان شروع کنید
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            fill="none"
            viewBox="0 0 11 12"
            className="-translate-y-0.5 -rotate-90 z-10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.3"
              d="M1.71 4.5h6.07m0 0v6.07m0-6.07-7 7"
            ></path>
          </svg>
        </Link>
      </div>

      <Faq />

      <Footer />
    </>
  );
};

export default Home;
