/**
 * Tracking token utilities for public order tracking pages.
 *
 * RISK: Tokens are passed as URL query parameters, which can leak via browser
 * history, proxy/CDN access logs, and Referer headers. EventSource does not
 * support custom headers, so this is an accepted residual risk. Mitigations:
 *   - Referrer-Policy: no-referrer is set on the SSE endpoint response.
 *   - The tracking page has no outbound links or third-party scripts.
 *   - Tokens expire after a configurable TTL (default 30 days).
 *
 * Token format: {expiryHex}:{hmac}
 *   expiryHex = hex-encoded expiration timestamp (ms since epoch)
 *   hmac      = HMAC-SHA256(orderId + expiryHex, secret).slice(0, 32)
 */

import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function requireSecret(): string {
  const secret = process.env.TRACKING_SECRET ?? process.env.OTP_SECRET;
  if (!secret) throw new Error("TRACKING_SECRET (or OTP_SECRET) must be set to generate tracking tokens");
  return secret;
}

export function generateTrackingToken(orderId: string): string {
  const secret = requireSecret();
  const expiry = Date.now() + TOKEN_TTL_MS;
  const expiryHex = expiry.toString(16);
  const hmac = createHmac("sha256", secret)
    .update(orderId + expiryHex)
    .digest("hex")
    .slice(0, 32);
  return `${expiryHex}:${hmac}`;
}

export function verifyTrackingToken(orderId: string, token: string): boolean {
  const secret = requireSecret();
  if (!token) return false;

  const sep = token.indexOf(":");
  if (sep === -1) return false;

  const expiryHex = token.slice(0, sep);
  const hmac = token.slice(sep + 1);
  if (!expiryHex || !hmac) return false;

  const expiry = parseInt(expiryHex, 16);
  if (Number.isNaN(expiry) || Date.now() > expiry) return false;

  const expected = createHmac("sha256", secret)
    .update(orderId + expiryHex)
    .digest("hex")
    .slice(0, 32);
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(hmac, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
