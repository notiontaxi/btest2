import { Calendar, MapPin } from 'lucide-react';
import { useNow } from '@/hooks/useNow';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function DateTimeCard() {
  const now = useNow(1000);
  const berlinTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const hour = parseInt(berlinTime.slice(0, 2), 10);
  const greeting = hour < 6 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="glass rounded-3xl p-8 animate-fade-in-up relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="h-3.5 w-3.5 text-accent-400" />
          <span className="text-ink-400 text-xs font-medium uppercase tracking-widest">Berlin, Germany</span>
        </div>

        <p className="text-ink-300 text-sm mb-1">{greeting}</p>

        <div className="font-display text-ink-50 font-bold text-6xl tracking-tight tabular-nums leading-none mb-3">
          {berlinTime}
        </div>

        <div className="flex items-center gap-2 text-ink-300">
          <Calendar className="h-4 w-4 text-ink-400" />
          <span className="text-sm font-medium">
            {DAYS[now.getDay()]}, {MONTHS[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}
