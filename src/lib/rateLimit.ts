import { redis } from "./redis";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local window_start = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local window_ms = tonumber(ARGV[4])
local member_id = ARGV[5]

redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

local count = redis.call('ZCARD', key)

if count >= max_requests then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retry_after = window_ms
  if #oldest >= 2 then
    local oldest_ts = tonumber(oldest[2])
    retry_after = math.max(0, oldest_ts + window_ms - now)
  end
  return {0, 0, retry_after}
end

local is_empty = count == 0
redis.call('ZADD', key, now, member_id)
if is_empty then
  redis.call('PEXPIRE', key, window_ms)
end

return {1, max_requests - count - 1, 0}
`;

export const slidingWindowRateLimit = async (key: string, config: RateLimitConfig): Promise<RateLimitResult> => {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const fullKey = `ratelimit:${key}`;
  const memberId = `${now}:${Math.random().toString(36).slice(2)}`;

  const result = (await redis.eval(SLIDING_WINDOW_SCRIPT, 1, fullKey, windowStart.toString(), now.toString(), config.maxRequests.toString(), config.windowMs.toString(), memberId)) as number[];

  return {
    allowed: result[0] === 1,
    remaining: result[1],
    retryAfterMs: result[2],
  };
};

export const OTP_REQUEST_LIMIT = { windowMs: 60_000, maxRequests: 3 } as const;
export const OTP_VERIFY_LIMIT = { windowMs: 60_000, maxRequests: 5 } as const;
