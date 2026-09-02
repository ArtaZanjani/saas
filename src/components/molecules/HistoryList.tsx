import { STATUS_LABELS } from "@/lib/constants";
import { formatToman } from "@/lib/format";

type Order = {
  id: string;
  productName: string;
  price: number;
  status: string;
};

const HistoryList = ({ orders }: { orders: Order[] }) => {
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">خرید دیگری ثبت نشده</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between text-sm text-foreground">
          <span className="min-w-0 flex-[0.5] truncate font-medium">{order.productName}</span>
          <span className="text-xs shrink-0 text-foreground ms-2">{formatToman(order.price)} تومان</span>
          <span className="text-xs shrink-0 text-muted-foreground bg-muted px-2 py-1 rounded-lg font-medium">{STATUS_LABELS[order.status] ?? order.status}</span>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
