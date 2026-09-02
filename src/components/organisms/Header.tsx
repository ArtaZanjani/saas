"use client";
import { Moon, Sun1, ArrowRight, ArrowLeft2 } from "iconsax-reactjs";
import { MobileMenuButton } from "@/components/organisms/SideBar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useIsMounted } from "usehooks-ts";
import { navItems } from "@/utils/routes";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const isMounted = useIsMounted()();

  const label = navItems
    .filter((item) => item.href.startsWith("/"))
    .find((item) => pathname === item.href)?.label;

  return (
    <div className="flex flex-col bg-card sticky top-0 z-30">
      <header className="py-3 flex items-center paddingBody">
        <div className="flex items-center gap-x-1.5 **:cursor-default **:select-none max-xl:hidden">
          <p className="text-sm font-medium">داشبورد</p>
          <ArrowLeft2 className="size-3.5" />
          <p className="text-sm font-medium">{label}</p>
        </div>
        <MobileMenuButton />

        <div className="flex items-center gap-3 ms-auto">
          <Button
            variant="secondary"
            size="icon"
            aria-label="تغییر تم"
            aria-pressed={isMounted ? resolvedTheme === "dark" : undefined}
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun1 className="not-dark:hidden" variant="Bold" />
            <Moon className="dark:hidden" variant="Bold" />
          </Button>
        </div>
      </header>

      <hr className="w-full" />

      <div className="py-4 flex items-center justify-between paddingBody xl:hidden">
        <div className="flex items-center gap-x-2 tablet:gap-x-4">
          <button aria-label="بازگشت به صفحه قبل">
            <ArrowRight className="size-6" />
          </button>

          <p className="font-bold">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
