import { Cloud, Sparkles } from 'lucide-react';
import { DateTimeCard } from '@/components/DateTimeCard';
import { WeatherCard } from '@/components/WeatherCard';
import { NewsCard } from '@/components/NewsCard';

function App() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 bg-grid relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-11 w-11 rounded-2xl glass-strong">
              <Cloud className="h-5 w-5 text-brand-300" />
            </div>
            <div>
              <h1 className="text-ink-50 font-display text-xl font-bold tracking-tight">Berlin Dashboard</h1>
              <p className="text-ink-400 text-xs">Weather · News · AI Updates</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 glass rounded-full px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-ink-300 text-xs font-medium">Live · Auto-refreshing</span>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Left column: Date/time + Weather */}
          <div className="lg:col-span-1 flex flex-col gap-5 lg:gap-6">
            <DateTimeCard />
            <WeatherCard />
          </div>

          {/* Right column: News */}
          <div className="lg:col-span-2 flex flex-col gap-5 lg:gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6 flex-1">
              <NewsCard variant="germany" />
              <NewsCard variant="ai" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 pb-4">
          <p className="text-ink-500 text-xs">
            Data: Open-Meteo · BBC · Google News
          </p>
          <p className="text-ink-500 text-xs flex items-center gap-1.5">
            Built with <Sparkles className="h-3 w-3 text-accent-400" /> in Berlin
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
