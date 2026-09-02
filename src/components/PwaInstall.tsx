"use client";

import usePwa from "use-pwa";
import { buttonVariants } from "./ui/button";
import { redirect, RedirectType } from "next/navigation";
import Link from "next/link";

const PwaInstall = () => {
  const { canInstall, install, isInstalled, isSupported } = usePwa();

  if (isInstalled) {
    redirect("/dashboard", RedirectType.replace);
  }

  return (
    <div className="flex gap-3 w-full mt-auto">
      {isSupported && canInstall && (
        <button className={buttonVariants({ className: "flex-1 h-11" })} onClick={install}>
          نصب
        </button>
      )}

      <Link className={buttonVariants({ variant: "outline", className: "mt-auto flex-1 h-11 border-border!" })} href="/dashboard">
        بازگشت
      </Link>
    </div>
  );
};

export default PwaInstall;
