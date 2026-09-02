import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Vazirmatn } from "next/font/google";
import ShellLayout from "@/components/providers/ShellLayout";
import ScrollLock from "@/components/providers/ScrollLock";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import  ThemeProvider  from "@/components/providers/themeProvider";
import Authentication from "@/components/organisms/Authentication";
import { verifyUser } from "@/actions/auth";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  icons: {
    icon: "/Logo.png",
    apple: "/icons/icon-512x512.png",
  },
  title: "سفارش‌یار",
  description: "جایگزین اکسل و دایرکت برای مدیریت سفارش فروشندگان اینستاگرامی",
  appleWebApp: {
    title: "سفارش‌یار",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

const vazirMatn = Vazirmatn({
  weight: "variable",
  variable: "--font-sans",
});

const Layout = async ({ children }: LayoutProps<"/">) => {
  const userData = await verifyUser();
  const isLoggedIn = !!userData?.user;
  return (

    <html lang="fa" dir="rtl" className={vazirMatn.className} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ShellLayout>
            {children}

            <Suspense>
              <ScrollLock />
            </Suspense>

            <Authentication isLogin={isLoggedIn} rotation={userData?.rotation ?? false} id={userData?.user?.id ?? ""} />

            <Toaster richColors position="top-center" />
          </ShellLayout>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
};

export default Layout;
