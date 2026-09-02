"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "iconsax-reactjs";
import { useSidebar } from "@/components/providers/ShellLayout";
import Image from "next/image";
import usePwa from "use-pwa";
import { navItems } from "@/utils/routes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { useEffect, useEffectEvent } from "react";
import type { UserRole } from "@/generated/prisma/enums";

const SideBar = ({ role }: { role: UserRole }) => {
  const { open, close } = useSidebar();
  const pathname = usePathname();
  const { isInstalled } = usePwa();

  const onPathnameChange = useEffectEvent(() => {
    close();
  });

  useEffect(() => {
    onPathnameChange();
  }, [pathname]);

  return (
    <aside className={`max-xl:fixed max-xl:top-0 max-xl:inset-s-0 max-xl:z-50 max-xl:h-dvh max-xl:w-full max-xl:flex max-xl:flex-col xl:block bg-card xl:p-4 xl:rounded-4xl xl:h-fit xl:sticky xl:top-25 duration-200 ${!open && "max-xl:opacity-0 max-xl:pointer-events-none"}`}>
      <div className="flex items-center justify-between pe-5 ps-3 py-3 border-b xl:hidden">
        <Button variant="ghost" size="icon" aria-label="بستن منو" onClick={close}>
          <ArrowRight className="size-5" />
        </Button>
        <div className="block w-8 h-8.75 relative">
          <Image className="object-contain" src="/Logo.png" alt="لوگو" fill sizes="100%" />
        </div>
      </div>

      <div className="max-xl:flex-1 max-xl:p-3 max-xl:overflow-y-auto">
        <nav className="space-y-1">
          {navItems
            .filter((e) => {
              if (e.href === "/dashboard/pwa" && isInstalled) return false;
              if (role === "ADMIN") {
                return e.href === "/dashboard/admin" || e.href === "/api/logout";
              }
              return e.href !== "/dashboard/admin";
            })
            .map((item) => {
              const active = item.href === pathname;
              const isLogout = item.href === "/api/logout";

              if (isLogout) {
                return (
                  <form key={item.href} id={`logout-form-${item.href}`} action={`/api/logout${isInstalled ? "?login=true" : ""}`} method="POST">
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button type="button" className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.97] text-destructive hover:bg-destructive/5">
                            <item.icon size="20" variant={active ? "Bold" : "Outline"} />
                            {item.label}
                          </button>
                        }
                      />
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <item.icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>خروج از حساب کاربری</AlertDialogTitle>
                          <AlertDialogDescription>برای ادامه کار باید دوباره وارد حساب کاربری خود شوید.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel variant="outline">انصراف</AlertDialogCancel>
                          <AlertDialogAction variant="destructive" type="submit" form={`logout-form-${item.href}`}>
                            خروج
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </form>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 rounded-xl relative px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.97] ${active ? "bg-foreground/5 font-semibold text-foreground" : "text-muted-foreground hover:bg-foreground/5"}`}>
                  {item.href === "/dashboard/pwa" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 translate-x-0.5">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M13 5v6h1.17L12 13.17 9.83 11H11V5h2m2-2H9v6H5l7 7 7-7h-4V3zm4 15H5v2h14v-2z" />
                    </svg>
                  ) : (
                    <item.icon size="20" variant={active ? "Bold" : "Outline"} />
                  )}

                  <p className={item.href === "/dashboard/pwa" ? "translate-x-1.5" : undefined}>{item.label}</p>
                </Link>
              );
            })}
        </nav>
      </div>
    </aside>
  );
};

const MobileMenuButton = () => {
  const { toggle } = useSidebar();

  return (
    <button className="size-9 flex justify-center items-center xl:hidden" type="button" onClick={toggle} aria-label="باز کردن منو">
      <div className="flex flex-col gap-y-1.5">
        <div className="h-0.5 w-5 bg-muted-foreground" />
        <div className="h-0.5 w-5 bg-muted-foreground" />
      </div>
    </button>
  );
};

export { SideBar as default, MobileMenuButton };
