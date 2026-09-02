import { orderEventBus } from "@/lib/sse";
import { verifyTrackingToken } from "@/utils/tracking";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  if (!orderId) {
    return new Response(JSON.stringify({ error: "orderId is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (!token || !verifyTrackingToken(orderId, token)) {
    return new Response(JSON.stringify({ error: "invalid or missing token" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return false;
        try {
          controller.enqueue(chunk);
          return true;
        } catch {
          cleanup();
          return false;
        }
      };

      const send = (data: Record<string, string>) => {
        return safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();
        request.signal.removeEventListener("abort", cleanup);
        request.signal.removeEventListener("close", cleanup);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      send({ type: "connected", orderId });

      const unsub = orderEventBus.subscribe(orderId, (event) => {
        send({ type: "status_change", status: event.status, updatedAt: event.updatedAt });
      });

      if (!unsub) {
        cleanup();
        return;
      }

      unsubscribe = unsub;

      heartbeat = setInterval(() => {
        send({ type: "heartbeat" });
      }, 15_000);

      request.signal.addEventListener("abort", cleanup, { once: true });
      request.signal.addEventListener("close", cleanup, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
