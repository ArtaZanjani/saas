"use client";
import { ArrowDown2 } from "iconsax-reactjs";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const faqs = [
  {
    title: "سفارش‌یار چیست؟",
    description:
      "سفارش‌یار یک پلتفرم مدیریت سفارش است که به شما کمک می‌کند سفارش‌ها، مشتریان، پرداخت‌ها و فرآیند فروش خود را به‌صورت یکپارچه مدیریت کنید.",
  },
  {
    title: "سفارش‌یار برای چه کسب‌وکارهایی مناسب است؟",
    description:
      "سفارش‌یار برای فروشگاه‌های اینستاگرامی، فروشگاه‌های آنلاین، کسب‌وکارهای خدماتی و هر مجموعه‌ای که سفارش ثبت و مدیریت می‌کند مناسب است.",
  },
  {
    title: "آیا مشتریان باید اپلیکیشن نصب کنند؟",
    description:
      "خیر، مشتریان تنها با ورود به لینک فروشگاه شما می‌توانند سفارش خود را ثبت و وضعیت آن را پیگیری کنند.",
  },
  {
    title: "آیا امکان پرداخت آنلاین وجود دارد؟",
    description:
      "بله، می‌توانید درگاه پرداخت را متصل کنید تا مشتریان هزینه سفارش را به‌صورت آنلاین پرداخت کنند.",
  },
  {
    title: "آیا می‌توانم وضعیت سفارش‌ها را مدیریت کنم؟",
    description:
      "بله، از لحظه ثبت سفارش تا آماده‌سازی، ارسال و تحویل، می‌توانید وضعیت هر سفارش را به‌سادگی مدیریت و به‌روزرسانی کنید.",
  },
  {
    title: "آیا اطلاعات من و مشتریان امن است؟",
    description:
      "بله، تمامی اطلاعات با استفاده از استانداردهای امنیتی روز محافظت شده و ارتباطات به‌صورت رمزنگاری‌شده انجام می‌شوند.",
  },
  {
    title: "آیا می‌توانم ظاهر صفحه سفارش را شخصی‌سازی کنم؟",
    description:
      "بله، می‌توانید لوگو، رنگ‌بندی و اطلاعات کسب‌وکار خود را مطابق با هویت برندتان تنظیم کنید.",
  },
  {
    title: "آیا قبل از خرید می‌توانم سفارش‌یار را آزمایش کنم؟",
    description:
      "بله، می‌توانید ابتدا سفارش‌یار را امتحان کنید و پس از اطمینان از مناسب بودن آن برای کسب‌وکارتان، اشتراک تهیه کنید.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="paddingBody max-w-160 py-[35dvh]">
      <h2 className="text-2xl sm:text-3xl font-bold">سوالات متداول</h2>

      <div className="flex flex-col gap-y-5 w-full mt-[5dvh]">
        {faqs.map((e, index) => (
          <div
            key={index}
            className="bg-card rounded-4xl p-5 cursor-pointer select-none"
            onClick={() =>
              setActiveIndex((prev) => (prev === index ? null : index))
            }
          >
            <div className="flex items-center justify-between gap-x-3">
              <span className="font-bold max-sm:text-sm">{e.title}</span>

              <motion.div
                animate={{
                  rotate: activeIndex === index ? 180 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 28,
                }}
              >
                <ArrowDown2 className="size-5" />
              </motion.div>
            </div>

            <AnimatePresence initial={false}>
              {activeIndex === index && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 28,
                  }}
                  className="overflow-hidden"
                >
                  <p className="pt-4 text-muted-foreground leading-7">
                    {e.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
