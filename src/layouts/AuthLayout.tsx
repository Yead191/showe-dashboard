import type { ReactNode } from 'react';
import { Logo } from '@/components/ui';
import { Sparkles, ScanLine, BarChart3 } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left — branded panel */}
      <aside className="panel-deep relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        {/* Decorative arcs */}
        <svg
          aria-hidden
          className="absolute -bottom-24 -left-24 opacity-30"
          width="480"
          height="480"
          viewBox="0 0 480 480"
          fill="none"
        >
          <circle cx="240" cy="240" r="180" stroke="#F5A800" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="240" cy="240" r="120" stroke="#F5A800" strokeOpacity="0.5" strokeWidth="1" />
          <circle cx="240" cy="240" r="60" stroke="#F5A800" strokeOpacity="0.6" strokeWidth="1" />
        </svg>

        <div className="relative z-10">
          <Logo size="md" inverse />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="eyebrow !text-accent mb-5">Programme platform</div>
          <h2 className="font-display font-extrabold text-4xl xl:text-5xl leading-[1.05] text-ink-inverse tracking-tight">
            The digital programme,{' '}
            <span className="italic font-medium text-accent">reimagined</span> for a phone in
            every seat.
          </h2>
          <p className="mt-5 text-ink-inverse/75 text-[15px] leading-relaxed max-w-md">
            Build, ship, and analyse interactive event programmes — from cover and welcome through
            cast, polls and post-event recap.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: Sparkles, label: 'Drag-and-drop programme workshop' },
              { icon: ScanLine, label: 'QR codes per event, downloads tracked' },
              { icon: BarChart3, label: 'Live analytics: dwell, taps, sponsor clicks' },
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-ink-inverse/90">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-white/10 text-accent">
                  <f.icon size={16} />
                </span>
                <span className="text-sm">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-ink-inverse/55">
          <span>© 2026 SHOWE</span>
        </div>
      </aside>

      {/* Right — auth form */}
      <main className="flex items-center justify-center px-5 sm:px-10 py-12 bg-surface-base">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo size="md" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
