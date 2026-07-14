import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageSquareLock } from 'lucide-react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { cn } from '@/lib/utils';
import { useResendOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';

const LENGTH = 6;
const RESEND_SECS = 60;

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [resendIn, setResendIn] = useState(RESEND_SECS);
  const inputs = useRef<HTMLInputElement[]>([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  if (!email) return null;

  const userEmail = email;

  function setDigit(i: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < LENGTH - 1) {
      inputs.current[i + 1]?.focus();
    }
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!t) return;
    const arr = Array(LENGTH).fill('');
    for (let i = 0; i < t.length; i++) arr[i] = t[i]!;
    setDigits(arr);
    inputs.current[Math.min(t.length, LENGTH - 1)]?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== LENGTH) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }

    try {
      const response = await verifyOtp({
        email: userEmail,
        oneTimeCode: Number(code),
      }).unwrap();

      toast.success(response.message || 'Code verified. Set your new password.');
      navigate('/reset-password', { replace: true });
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Invalid verification code.')
          : 'Invalid verification code.';
      toast.error(errorMessage);
    }
  }

  async function resend() {
    if (resendIn > 0 || isResending) return;

    try {
      const response = await resendOtp({ email: userEmail }).unwrap();
      setResendIn(RESEND_SECS);
      setDigits(Array(LENGTH).fill(''));
      inputs.current[0]?.focus();
      toast.success(response.message || 'A new code is on its way.');
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to resend code.')
          : 'Failed to resend code.';
      toast.error(errorMessage);
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
          <MessageSquareLock size={20} />
        </div>

        <div className="eyebrow mb-3">Verification</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink leading-tight">
          Enter the 6-digit code.
        </h1>
        <p className="mt-2 text-ink-muted text-[15px]">
          We’ve sent a verification code to{' '}
          <span className="font-semibold text-ink">{userEmail}</span>. It expires in 10 minutes.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <div className="flex justify-between gap-2.5" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  if (el) inputs.current[i] = el;
                }}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className={cn(
                  'w-12 h-14 sm:w-14 sm:h-16 rounded-xl border bg-surface-raised text-ink text-center font-display font-extrabold text-2xl tabular',
                  'border-line focus:border-primary focus:shadow-ring outline-none transition-all duration-200 ease-smooth',
                  d && 'border-primary/50'
                )}
              />
            ))}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={isVerifying}
            block
            style={{ height: 48, fontSize: 15 }}
            icon={!isVerifying && <ArrowRight size={16} />}
            iconPosition="end"
          >
            {isVerifying ? 'Verifying…' : 'Verify code'}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-muted">
          Didn’t receive a code?{' '}
          <button
            type="button"
            onClick={() => void resend()}
            className={cn(
              'font-semibold transition-colors',
              resendIn > 0 || isResending
                ? 'text-ink-faint cursor-default'
                : 'text-primary hover:text-primary-700'
            )}
            disabled={resendIn > 0 || isResending}
          >
            {isResending ? 'Resending…' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend'}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
