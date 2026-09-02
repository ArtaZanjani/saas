import { verifyTrackingToken } from "@/utils/tracking";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "CDN-Cache-Control": "no-store",
  };

  if (!orderId || !token || !verifyTrackingToken(orderId, token)) {
    return new Response(null, { status: 403, headers });
  }

  return new Response(null, { status: 200, headers });
}
