import { Clock, ReceiptItem, ShoppingCart, WalletMoney } from "iconsax-reactjs";
import { formatToman } from "@/lib/format";

interface StatsCardsProps {
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const StatsCards = ({ todaySales, totalOrders, pendingOrders, totalRevenue }: StatsCardsProps) => {
  const ss = [
    {
      title: "فروش امروز",
      value: todaySales.toLocaleString("fa-IR"),
      icon: ShoppingCart,
    },
    {
      title: "کل سفارش‌ها",
      value: totalOrders.toLocaleString("fa-IR"),
      icon: ReceiptItem,
    },
    {
      title: "در انتظار تایید",
      value: pendingOrders.toLocaleString("fa-IR"),
      icon: Clock,
    },
    {
      title: "درآمد",
      value: formatToman(totalRevenue),
      icon: WalletMoney,
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 xl:gap-5">
      {ss.map((e, index) => (
        <div className="flex-1 bg-card rounded-3xl ring-1 ring-foreground/5 dark:ring-foreground/10 p-3 flex flex-col" key={index}>
          <div className="size-10 flex justify-center items-center bg-primary rounded-full translate-x-0.5">
            <e.icon className="size-5.5 text-white" variant="Bold" />
          </div>

          <p className="text-sm font-medium mt-4">{e.title}</p>
          <p className="font-medium mt-1">{e.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
