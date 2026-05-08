import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success('Verification code sent. Check your inbox.');
    navigate('/verify-otp', { state: { email } });
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent flex items-center justify-center mb-5">
          <Mail size={20} />
        </div>

        <div className="eyebrow mb-3">Reset password</div>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-ink leading-tight">
          Forgot your password?
        </h1>
        <p className="mt-2 text-ink-muted text-[15px]">
          Enter the email associated with your account and we’ll send you a 6-digit code to verify.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
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
              required
            />
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
            {submitting ? 'Sending code…' : 'Send verification code'}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-muted">
          Remembered it?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-700">
            Sign in instead
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
