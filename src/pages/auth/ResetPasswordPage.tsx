import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, KeyRound, Check, X } from 'lucide-react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { cn } from '@/lib/utils';

const RULES: { test: (s: string) => boolean; label: string }[] = [
  { test: (s) => s.length >= 8, label: 'At least 8 characters' },
  { test: (s) => /[A-Z]/.test(s), label: 'One uppercase letter' },
  { test: (s) => /[0-9]/.test(s), label: 'One number' },
  { test: (s) => /[^A-Za-z0-9]/.test(s), label: 'One symbol' },
];

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => RULES.filter((r) => r.test(pwd)).length, [pwd]);
  const strengthLabel = ['Weak', 'Weak', 'Okay', 'Good', 'Strong'][score];
  const strengthColor = ['#B42318', '#B42318', '#DA7101', '#437A22', '#014B52'][score];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score < 3) {
      toast.error('Please choose a stronger password.');
      return;
    }
    if (pwd !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success('Password updated. Sign in with your new password.');
    navigate('/login');
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-5">
          <KeyRound size={20} />
        </div>

        <div className="eyebrow mb-3">New password</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink leading-tight">
          Set a new password.
        </h1>
        <p className="mt-2 text-ink-muted text-[15px]">
          Choose something strong. We’ll sign you out of all other devices.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div>
            <label className="field-label">New password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="input-base pr-12"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink p-1.5 rounded-full"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength meter */}
            {pwd && (
              <div className="mt-2.5">
                <div className="flex gap-1.5 mb-2">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className="flex-1 h-1.5 rounded-full bg-surface-sunken overflow-hidden"
                    >
                      <div
                        className="h-full transition-all duration-300 ease-smooth"
                        style={{
                          width: seg <= score ? '100%' : '0%',
                          background: strengthColor,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-[12px] font-semibold" style={{ color: strengthColor }}>
                  {strengthLabel} password
                </div>
              </div>
            )}
          </div>

          {/* Rules */}
          <ul className="grid grid-cols-2 gap-1.5">
            {RULES.map((r) => {
              const ok = r.test(pwd);
              return (
                <li
                  key={r.label}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[12.5px] transition-colors',
                    ok ? 'text-success' : 'text-ink-faint'
                  )}
                >
                  {ok ? <Check size={13} /> : <X size={13} />}
                  {r.label}
                </li>
              );
            })}
          </ul>

          <div>
            <label className="field-label">Confirm password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-base"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {confirm && pwd !== confirm && (
              <p className="mt-1.5 text-[12.5px] text-danger">Passwords don’t match.</p>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            style={{ height: 48, fontSize: 15 }}
            icon={!submitting && <ArrowRight size={16} />}
            iconPosition="end"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-muted">
          <Link to="/login" className="text-primary font-semibold hover:text-primary-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
