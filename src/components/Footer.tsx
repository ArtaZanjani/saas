import React from "react";
import { publicUrls } from "@/utils/routes";
import Link from "next/link";
import { Copyright } from "iconsax-reactjs";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full py-5 bg-card">
      <div className="paddingBody flex flex-col gap-y-7">
        <div className="w-full flex justify-between items-end">  
          <div className="flex items-center gap-x-5">
            {publicUrls.map((e) => (
              <Link
                className="text-sm hover:text-foreground font-medium"
                href={e.path}
                key={e.path}
              >
                {e.name}
              </Link>
            ))}
          </div>

          <Image
            src="/icons/icon-512x512.png"
            alt="لوگو"
            className="rounded-xl overflow-hidden"
            width={55}
            height={55}
            priority
            quality={100}
          />
        </div>

        <hr />

        <div className="flex items-center gap-x-2 mx-auto text-center">
          <Copyright className="size-5 max-[419px]:hidden" />
          تمامی حقوق مادی و معنوی برای سفارش‌یار محفوظ است.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
