import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleCatch } from "@/utils/function";
import { SubscriptionPlan } from "@/generated/prisma/enums";

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { count } = await prisma.store.updateMany({
      where: {
        subscriptionEndsAt: { lte: new Date() },
        subscriptionPlan: { not: SubscriptionPlan.EXPIRED },
      },
      data: { subscriptionPlan: SubscriptionPlan.EXPIRED },
    });

    return NextResponse.json({ expired: count }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: handleCatch(error).message },
      { status: 502 },
    );
  }
};
