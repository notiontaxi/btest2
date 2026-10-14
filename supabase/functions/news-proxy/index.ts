// Requests are protected by the database-backed IP rate limiter below.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// 30 requests per 60-second window per IP
const RATE_LIMIT = 30;
const WINDOW_SECONDS = 60;

const FEEDS: Record<string, { url: string; source: string }[]> = {
  germany: [
    { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml", source: "BBC Europe" },
    { url: "https://rss.dw.com/rdf/rss-en-all", source: "DW" },
  ],
  ai: [
    { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC Tech" },
    { url: "https://techcrunch.com/feed/", source: "TechCrunch" },
  ],
};

const GERMANY_KEYWORDS = ["german", "germany", "berlin", "merkel", "bundes", "europe", "european", "eu"];
const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "neural", "gpt", "llm",
  "chatbot", "openai", "deepmind", "robotics", "gemini", "copilot", "anthropic",
  "model", "algorithm", "generative",
];

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

function parseItems(xml: string, defaultSource: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) ?? [])[1]?.trim() ?? "";
    const link =
      (block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/) ?? [])[1]?.trim() ??
      (block.match(/<guid[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/guid>/) ?? [])[1]?.trim() ??
      "";
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ?? [])[1]?.trim() ?? "";
    const source = (block.match(/<source[^>]*>([\s\S]*?)<\/source>/) ?? [])[1]?.trim() ?? defaultSource;
    if (title && link) items.push({ title, link, pubDate, source });
  }
  return items;
}

async function fetchFeed(url: string, source: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "BerlinDashboard/1.0" } });
    if (!res.ok) return [];
    const text = await res.text();
    return parseItems(text, source);
  } catch {
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Rate limiting: identify caller IP from standard proxy headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: requestCount, error: rlError } = await supabase.rpc(
      "increment_rate_limit",
      { p_ip: ip, p_window_seconds: WINDOW_SECONDS },
    );

    if (rlError) {
      // Log but don't block on rate-limit errors to keep the app working
      console.error("Rate limit check failed:", rlError.message);
    } else if (requestCount > RATE_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = new URL(req.url);
    const variant = url.searchParams.get("variant") ?? "germany";

    if (variant !== "germany" && variant !== "ai") {
      return new Response(JSON.stringify({ error: "Invalid variant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const feeds = FEEDS[variant];
    const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
    const all = results.flat();

    const keywords = variant === "germany" ? GERMANY_KEYWORDS : AI_KEYWORDS;
    const filtered = all.filter((item) => {
      const lower = item.title.toLowerCase();
      return keywords.some((k) => lower.includes(k));
    });

    const unique = new Map<string, FeedItem>();
    for (const item of [...filtered, ...all]) {
      if (!unique.has(item.title)) unique.set(item.title, item);
    }
    const final = Array.from(unique.values()).slice(0, 10);

    return new Response(JSON.stringify({ items: final }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
