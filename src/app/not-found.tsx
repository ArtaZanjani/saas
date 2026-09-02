import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const notFound = () => {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center max-w-98 mx-auto paddingBody">
      <div className="w-full aspect-video relative">
        <Image className="object-contain" src="/404.png" alt="" fill sizes="100%" priority />
      </div>
      <p className="font-bold mt-4.5">صفحه‌ای که دنبال آن بودید پیدا نشد</p>
      <p className="mt-1 text-sm">
        متأسفیم، این صفحه وجود ندارد یا از دسترس خارج شده است.
      </p>

      <Link
        className={buttonVariants({ size: "lg", className: "w-full mt-10" })}
        href="/"
      >
        صفحه اصلی
      </Link>
    </div>
  );
};

export default notFound;
