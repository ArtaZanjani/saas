/**
 * Redis-backed OrderEventBus for Server-Sent Events.
 *
 * Uses Redis Pub/Sub with a pattern subscription (PSUBSCRIBE order:*) so that
 * events emitted on any instance reach SSE subscribers on all instances.
 * A single shared subscriber connection (via redis.duplicate()) handles
 * fan-out for all orders.
 *
 * LIMITATION: This implementation requires a long-running Node.js process
 * to hold SSE connections and the Redis subscriber. It is NOT compatible with
 * serverless platforms (Vercel, AWS Lambda) that kill functions after a timeout.
 * For serverless, use short-interval polling or a dedicated SSE server.
 */

import type Redis from "ioredis";
import { redis } from "@/lib/redis";
import { SSE_MAX_LISTENERS_PER_ORDER, SSE_MAX_TOTAL_LISTENERS, SSE_STALE_THRESHOLD_MS, SSE_SWEEP_INTERVAL_MS } from "@/lib/constants";

const CHANNEL_PREFIX = "order:";

type OrderEvent = {
  orderId: string;
  status: string;
  updatedAt: string;
};

type Listener = (event: OrderEvent) => void;

type Subscription = {
  listener: Listener;
  unsubscribe: () => void;
  createdAt: number;
};

class OrderEventBus {
  private listeners = new Map<string, Set<Subscription>>();
  private sweepTimer: ReturnType<typeof setInterval> | null = null;
  private subscriber: Redis | null = null;

  constructor() {
    this.setupSubscriber();

    if (process.env.NODE_ENV === "production") {
      this.sweepTimer = setInterval(() => this.sweep(), SSE_SWEEP_INTERVAL_MS);
    }
  }

  private setupSubscriber() {
    this.subscriber = redis.duplicate();

    this.subscriber.on("error", (err) => {
      console.error("[SSE] Redis subscriber error:", err);
    });

    this.subscriber.psubscribe("order:*", (err) => {
      if (err) console.error("[SSE] Redis PSUBSCRIBE failed:", err);
    });

    this.subscriber.on("pmessage", (_pattern: string, channel: string, message: string) => {
      if (!channel.startsWith(CHANNEL_PREFIX)) return;
      const orderId = channel.slice(CHANNEL_PREFIX.length);
      this.dispatchLocal(orderId, message);
    });
  }

  private dispatchLocal(orderId: string, message: string) {
    const set = this.listeners.get(orderId);
    if (!set || set.size === 0) return;

    let event: OrderEvent;
    try {
      event = JSON.parse(message);
    } catch {
      return;
    }

    const dead: Subscription[] = [];

    for (const sub of set) {
      try {
        sub.listener(event);
      } catch {
        dead.push(sub);
      }
    }

    for (const sub of dead) {
      sub.unsubscribe();
    }
  }

  subscribe(orderId: string, listener: Listener): (() => void) | null {
    if (!orderId) return null;

    if (this.listenerCount() >= SSE_MAX_TOTAL_LISTENERS) {
      console.warn(`[SSE] Global listener cap reached (${SSE_MAX_TOTAL_LISTENERS}). Rejecting subscription for ${orderId}.`);
      return null;
    }

    const existing = this.listeners.get(orderId);
    if (existing && existing.size >= SSE_MAX_LISTENERS_PER_ORDER) {
      this.pruneStale(orderId);
      const after = this.listeners.get(orderId);
      if (after && after.size >= SSE_MAX_LISTENERS_PER_ORDER) {
        console.warn(`[SSE] Per-order cap reached (${SSE_MAX_LISTENERS_PER_ORDER}) for order ${orderId}. Rejecting subscription.`);
        return null;
      }
    }

    if (!this.listeners.has(orderId)) {
      this.listeners.set(orderId, new Set());
    }

    const sub: Subscription = {
      listener,
      createdAt: Date.now(),
      unsubscribe: () => {
        const set = this.listeners.get(orderId);
        if (set) {
          set.delete(sub);
          if (set.size === 0) this.listeners.delete(orderId);
        }
      },
    };

    this.listeners.get(orderId)!.add(sub);
    return sub.unsubscribe;
  }

  emit(orderId: string, status: string, updatedAt: string) {
    const event: OrderEvent = { orderId, status, updatedAt };
    redis.publish(`${CHANNEL_PREFIX}${orderId}`, JSON.stringify(event)).catch((err) => {
      console.error("[SSE] Redis PUBLISH failed:", err);
    });
  }

  listenerCount(): number {
    let count = 0;
    for (const set of this.listeners.values()) {
      count += set.size;
    }
    return count;
  }

  orderCount(): number {
    return this.listeners.size;
  }

  private pruneStale(orderId: string) {
    const set = this.listeners.get(orderId);
    if (!set) return;

    const now = Date.now();
    for (const sub of set) {
      if (now - sub.createdAt > SSE_STALE_THRESHOLD_MS) {
        sub.unsubscribe();
      }
    }
  }

  private sweep() {
    const now = Date.now();
    for (const [orderId, set] of this.listeners) {
      for (const sub of set) {
        if (now - sub.createdAt > SSE_STALE_THRESHOLD_MS) {
          sub.unsubscribe();
        }
      }
      if (set.size === 0) this.listeners.delete(orderId);
    }
  }

  destroy() {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    if (this.subscriber) {
      this.subscriber.punsubscribe();
      this.subscriber.disconnect();
      this.subscriber = null;
    }
    for (const set of this.listeners.values()) {
      set.clear();
    }
    this.listeners.clear();
  }
}

const globalForSse = globalThis as unknown as { __orderEventBus: OrderEventBus };

export const orderEventBus = globalForSse.__orderEventBus ?? new OrderEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForSse.__orderEventBus = orderEventBus;
}
