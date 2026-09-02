import * as z from "zod";

const orderItemSchema = z.object({
  productName: z.string().min(1),
  price: z.number().int().nonnegative(),
  //   quantity: z.number().int().positive().default(1),
});

export const orderItemsSchema = z.array(orderItemSchema).min(1);

export type OrderItem = z.infer<typeof orderItemSchema>;
