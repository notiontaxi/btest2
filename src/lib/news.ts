export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/news-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchFromProxy(variant: 'germany' | 'ai'): Promise<NewsItem[]> {
  const res = await fetch(`${PROXY_URL}?variant=${variant}`, {
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Proxy error (${res.status})`);
  const json = await res.json();
  if (!Array.isArray(json.items)) throw new Error('Unexpected response shape');
  return json.items as NewsItem[];
}

export async function fetchGermanyNews(): Promise<NewsItem[]> {
  return fetchFromProxy('germany');
}

export async function fetchAINews(): Promise<NewsItem[]> {
  return fetchFromProxy('ai');
}

export function formatTimeAgo(pubDate: string): string {
  if (!pubDate) return '';
  const date = new Date(pubDate);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  return `${Math.max(minutes, 1)}m ago`;
}
