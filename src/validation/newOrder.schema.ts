import * as z from "zod";
import { phoneNumberSchema } from "./global.schema";

const newOrderSchema = z.object({
  userName: z.string().min(1, "وارد کردن نام مشتری الزامی است"),
  phoneNumber: phoneNumberSchema,
  address: z.string().min(1, "وارد کردن آدرس الزامی است"),
  productIds: z.array(z.string()).min(1, "انتخاب حداقل یک محصول الزامی است"),
});

export default newOrderSchema;
