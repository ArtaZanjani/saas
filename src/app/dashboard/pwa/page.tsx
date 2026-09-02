import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import PwaInstall from "@/components/PwaInstall";

export const metadata: Metadata = {
  title: "نصب اپلیکیشن | سفارش‌یار",
};

const iosSteps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor" className="-translate-y-0.5">
        <g>
          <rect fill="none" height="24" width="24" />
        </g>
        <g>
          <path d="M16,5l-1.42,1.42l-1.59-1.59V16h-1.98V4.83L9.42,6.42L8,5l4-4L16,5z M20,10v11c0,1.1-0.9,2-2,2H6c-1.11,0-2-0.9-2-2V10 c0-1.11,0.89-2,2-2h3v2H6v11h12V10h-3V8h3C19.1,8,20,8.89,20,10z" />
        </g>
      </svg>
    ),
    title: "Share",
    description: "انتخاب این گزینه از نوار پایین",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    ),
    title: "Add to Home Screen",
    description: "انتخاب این گزینه در منوی ظاهر شده",
  },
  {
    icon: null,
    title: "Add",
    description: "زدن این گزینه",
  },
];

const androidSteps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
    title: "Menu",
    description: "انتخاب این گزینه از نوار بالا",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M18 1.01L8 1c-1.1 0-2 .9-2 2v3h2V5h10v14H8v-1H6v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM10 15h2V8H5v2h3.59L3 15.59 4.41 17 10 11.41V15z" />
      </svg>
    ),
    title: "Add to Home Screen",
    description: "انتخاب این گزینه در منوی ظاهر شده",
  },
  {
    icon: null,
    title: "Install",
    description: "زدن این گزینه",
  },
];

const desktopSteps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="currentColor">
        <g>
          <rect fill="none" height="24" width="24" />
        </g>
        <g>
          <g>
            <path d="M20,17H4V5h8V3H4C2.89,3,2,3.89,2,5v12c0,1.1,0.89,2,2,2h4v2h8v-2h4c1.1,0,2-0.9,2-2v-3h-2V17z" />
            <polygon points="17,14 22,9 20.59,7.59 18,10.17 18,3 16,3 16,10.17 13.41,7.59 12,9" />
          </g>
        </g>
      </svg>
    ),
    title: "Install",
    description: "انتخاب این گزینه از نوار بالا",
  },
  {
    icon: null,
    title: "Install",
    description: "زدن این گزینه",
  },
];

const Pwa = async () => {
  const ua = (await headers()).get("user-agent") ?? "";

  const device = /iPhone|iPad|iPod/i.test(ua) ? "ios" : /Android/i.test(ua) ? "android" : "desktop";
  const steps = device === "ios" ? iosSteps : device === "android" ? androidSteps : desktopSteps;
  return (
    <div className="w-full max-w-md mx-auto p-5 flex flex-col items-center h-dvh">
      <Image src="/icons/icon-512x512.png" alt="لوگو" className="rounded-4xl overflow-hidden" width={90} height={90} priority quality={100} />
      <p className="text-center mt-5 w-full">
        {device === "desktop" ? (
          "وب‌اپلیکیشن سفارش‌یار را روی دسکتاپ خود نصب کنید"
        ) : (
          <>
            وب‌اپلیکیشن سفارش‌یار را به صفحه اصلی تلفن همراه <br /> خود اضافه کنید
          </>
        )}
      </p>

      <div className="flex flex-col gap-y-7 w-full mt-20">
        {steps.map((e, index) => (
          <div className="flex items-center gap-x-3" key={index}>
            {/* add type of icon is component use <e.iconelse show e.icon */}
            <div className={`size-10 rounded-full flex items-center justify-center text-foreground overflow-hidden [&_svg]:size-6 ${index === steps.length - 1 ? "bg-white p-1" : "bg-card"}`}>{e.icon ? e.icon : <Image src="/icons/icon-512x512.png" alt="لوگو" width={40} height={40} priority quality={100} />}</div>

            <div className="space-y-1">
              <p className="text-xs text-foreground font-medium">{e.title}</p>
              <p className="text-xs">{e.description}</p>
            </div>
          </div>
        ))}
      </div>

      <PwaInstall />
    </div>
  );
};

export default Pwa;
