/*
# Create rate_limits table and atomic upsert function

## Purpose
Stores per-IP request counts for the news-proxy edge function rate limiter.
Since edge function instances don't share memory, all rate-limit state must
live in the database.

## New Tables
- `rate_limits`
  - `ip` (text, primary key) — the client IP address
  - `count` (integer, not null) — number of requests in the current window
  - `window_start` (timestamptz, not null) — when the current window began

## New Functions
- `increment_rate_limit(p_ip text, p_window_seconds integer)` — atomically
  upserts the row for the given IP: resets the window if it has expired,
  otherwise increments the count. Returns the updated count as an integer.

## Security
- RLS enabled on `rate_limits` with NO policies — the table is intentionally
  inaccessible to anon/authenticated roles. Only the service role key (used
  exclusively by the edge function server-side) can read and write it.
- The upsert function is SECURITY DEFINER so it runs with elevated privileges,
  and EXECUTE is granted only to the `service_role`.
*/

CREATE TABLE IF NOT EXISTS rate_limits (
  ip text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION increment_rate_limit(p_ip text, p_window_seconds integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO rate_limits (ip, count, window_start)
  VALUES (p_ip, 1, now())
  ON CONFLICT (ip) DO UPDATE
    SET
      count = CASE
        WHEN now() - rate_limits.window_start > (p_window_seconds || ' seconds')::interval
          THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN now() - rate_limits.window_start > (p_window_seconds || ' seconds')::interval
          THEN now()
        ELSE rate_limits.window_start
      END
  RETURNING count INTO v_count;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION increment_rate_limit(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_rate_limit(text, integer) TO service_role;
