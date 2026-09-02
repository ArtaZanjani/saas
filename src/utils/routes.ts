import { Category2, AddCircle, Card, Setting2, Logout, Box, Security } from "iconsax-reactjs";

export const navItems = [
  { href: "/dashboard", label: "سفارش‌ها", icon: Category2 },
  { href: "/dashboard?new=true", label: "سفارش جدید", icon: AddCircle },
  { href: "/dashboard/products", label: "مدیریت محصولات", icon: Box },
  { href: "/dashboard/settings", label: "تنظیمات", icon: Setting2 },
  { href: "/dashboard/pwa", label: "نصب اپلیکیشن", icon: Setting2 },
  { href: "/dashboard/plan", label: "خرید اشتراک", icon: Card },
  { href: "/dashboard/admin", label: "پنل ادمین", icon: Security },
  { href: "/api/logout", label: "خروج", icon: Logout },
] as const;


export const publicUrls = [
  { name: "تعرفه‌ها", path: "/tariffs" },
  { name: "قوانین", path: "/rules" },
] as const;