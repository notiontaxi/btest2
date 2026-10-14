import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Newspaper, RefreshCw } from 'lucide-react';
import { fetchAINews, fetchGermanyNews, formatTimeAgo, type NewsItem } from '@/lib/news';

interface Props {
  variant: 'germany' | 'ai';
}

export function NewsCard({ variant }: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = variant === 'germany' ? await fetchGermanyNews() : await fetchAINews();
      setItems(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [variant]);

  const title = variant === 'germany' ? 'Germany News' : 'AI Innovations';
  const subtitle = variant === 'germany' ? 'Latest from Germany' : 'Latest in Artificial Intelligence';
  const accentColor = variant === 'germany' ? 'text-brand-300' : 'text-accent-400';
  const dotColor = variant === 'germany' ? 'bg-brand-400' : 'bg-accent-400';

  return (
    <div className="glass rounded-3xl p-6 animate-fade-in-up flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <Newspaper className={`h-4 w-4 ${accentColor}`} />
          </div>
          <div>
            <h3 className="text-ink-50 font-display text-base font-semibold">{title}</h3>
            <p className="text-ink-400 text-xs">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          className="p-2 rounded-xl hover:bg-white/5 transition text-ink-400 hover:text-ink-100"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : error || items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-ink-400 text-sm">Couldn't load news.</p>
          <button
            onClick={() => load()}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-ink-200 hover:bg-white/10 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 pr-1">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl px-4 py-3 hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/[0.06]"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-2 h-1.5 w-1.5 rounded-full ${dotColor} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-ink-100 text-sm font-medium leading-snug group-hover:text-ink-50 transition line-clamp-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {item.source && (
                      <span className="text-ink-500 text-xs font-medium">{item.source}</span>
                    )}
                    {item.pubDate && (
                      <>
                        <span className="text-ink-600 text-xs">·</span>
                        <span className="text-ink-500 text-xs">{formatTimeAgo(item.pubDate)}</span>
                      </>
                    )}
                    <ExternalLink className="h-3 w-3 text-ink-600 group-hover:text-ink-300 transition ml-auto" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
