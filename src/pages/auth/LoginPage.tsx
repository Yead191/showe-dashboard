import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Crown, Building2 } from 'lucide-react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DEMO_CREDS } from '@/constants/auth';
import type { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginRole = useAuthStore((s) => s.loginRole);
  const setLoginRole = useAuthStore((s) => s.setLoginRole);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await login(email, password, loginRole);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? 'Login failed.');
      return;
    }
    toast.success(`Welcome back${loginRole === 'super_admin' ? ', admin' : ''}.`);
    navigate(from ?? (loginRole === 'super_admin' ? '/admin' : '/owner'), { replace: true });
  }

  function fillDemo() {
    const c = loginRole === 'super_admin' ? DEMO_CREDS.super_admin : DEMO_CREDS.venue_owner;
    setEmail(c.email);
    setPassword(c.password);
  }

  function selectRole(role: UserRole) {
    setLoginRole(role);
    setError(null);
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <div className="eyebrow mb-3">Sign in</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink leading-tight">
          Welcome back to SHOWE.
        </h1>
        <p className="mt-2 text-ink-muted text-[15px]">
          Choose your role to continue. Don’t have an account? Venue owners register on{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://showe-web.vercel.app/"
            className="text-primary font-semibold underline-offset-4 hover:underline">
            showe-web.vercel.app
          </a>
          .
        </p>

        {/* Role toggle */}
        <div
          role="tablist"
          aria-label="Sign in as"
          className="mt-7 grid grid-cols-2 gap-2 p-1.5 bg-surface-sunken rounded-full border border-line"
        >
          {([
            { value: 'venue_owner', label: 'Organisation', icon: Building2 },
            { value: 'super_admin', label: 'Admin', icon: Crown },
          ] as const).map(({ value, label, icon: Icon }) => {
            const active = loginRole === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectRole(value)}
                className={cn(
                  'relative flex items-center justify-center gap-2 h-11 rounded-full font-semibold text-sm transition-all duration-200 ease-smooth',
                  active
                    ? 'bg-primary text-ink-inverse shadow-medium'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@venue.co.uk"
              className="input-base"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="field-label !mb-0">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-700"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink p-1.5 rounded-full"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-line text-primary focus:ring-primary"
            />
            <span className="text-sm text-ink-muted">Keep me signed in for 30 days</span>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            style={{ height: 48, fontSize: 15 }}
            icon={!submitting && <ArrowRight size={16} />}
            iconPosition="end"
          >
            {submitting ? 'Signing you in…' : `Sign in as ${loginRole === 'super_admin' ? 'admin' : 'organiser'}`}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-surface-sunken border border-dashed border-line">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-ink">Demo credentials</div>
              <p className="text-[12.5px] text-ink-muted mt-0.5">
                Use these to explore the dashboard.
              </p>
              <div className="mt-2.5 text-[13px] text-ink font-mono space-y-0.5">
                <div>
                  <span className="text-ink-faint">email · </span>
                  {(loginRole === 'super_admin' ? DEMO_CREDS.super_admin : DEMO_CREDS.venue_owner).email}
                </div>
                <div>
                  <span className="text-ink-faint">password · </span>
                  showedemo
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="btn-ghost shrink-0 !h-9 !text-xs"
            >
              Fill in
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
