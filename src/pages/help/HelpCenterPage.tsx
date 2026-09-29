import { useState, type FormEvent } from "react";
import {
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { Button } from "antd";
import { toast } from "sonner";
import { useGetProfileQuery } from "@/store/api/authApi";

const FORMSPREE_URL =
  import.meta.env.VITE_FORMSPREE_URL || "https://formspree.io/f/mgogqaeg";
const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "Backstage@showe.biz";

type Status = "idle" | "sending" | "sent" | "error";

export default function HelpCenterPage() {
  const { data: profile } = useGetProfileQuery();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast.success(`Copied ${SUPPORT_EMAIL} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy email address.");
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      if (!res.ok) throw new Error("Formspree error");

      form.reset();
      setStatus("sent");
      toast.success("Inquiry sent successfully to our Backstage team!");
    } catch {
      setStatus("error");
      toast.error(
        `Couldn't send inquiry. Please email ${SUPPORT_EMAIL} directly.`,
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Top ambient highlight */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface-raised via-surface-base to-primary/5 p-8 sm:p-10 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-bold tracking-wide uppercase">
              <LifeBuoy size={13} />
              Backstage Concierge Support
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              Need a hand with your show or venue?
            </h1>
            <p className="text-ink-muted text-base leading-relaxed">
              Whether you need guidance with the Programme Studio, event
              configuration, or bespoke onboarding, our team is right here to
              assist.
            </p>
          </div>

          {/* Quick email card */}
          <div className="shrink-0 p-5 rounded-2xl bg-surface-base/90 border border-line backdrop-blur-sm shadow-sm space-y-3 min-w-[280px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              Direct Contact
            </div>
            <div className="flex items-center justify-between gap-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-display font-bold text-base text-primary hover:underline truncate"
              >
                {SUPPORT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 text-ink-faint hover:text-primary hover:bg-surface-sunken rounded-lg transition-colors shrink-0"
                title="Copy email address"
              >
                {copied ? (
                  <Check size={16} className="text-success" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-ink-muted pt-1 border-t border-line/60">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
              <span>Response under 2 hours during show hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left column: Key support highlights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-line bg-surface-raised p-6 space-y-5">
            <h3 className="font-display font-bold text-lg text-ink">
              Dedicated Producer Support
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-ink">
                    Programme Studio Guidance
                  </h4>
                  <p className="text-[12.5px] text-ink-muted leading-relaxed mt-0.5">
                    Help with layout formatting, custom blocks, and interactive
                    reader modules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={16} />
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-ink">
                    Showtime Priority
                  </h4>
                  <p className="text-[12.5px] text-ink-muted leading-relaxed mt-0.5">
                    Live performance issues receive immediate, urgent
                    escalation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-ink">
                    Front-of-House QR & Signage
                  </h4>
                  <p className="text-[12.5px] text-ink-muted leading-relaxed mt-0.5">
                    High-resolution printable asset packs tailored for your
                    venue foyer.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-line/70">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  `Priority inquiry from ${profile?.name || "Partner"}`,
                )}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-700 transition-colors"
              >
                <span>Compose email client</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Right column: Formspree Inquiry Form */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-line bg-surface-raised p-8 shadow-soft">
            {status === "sent" ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-success/10 text-success flex items-center justify-center">
                  <Check size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-ink">
                  Inquiry Received
                </h3>
                <p className="text-ink-muted text-sm max-w-md mx-auto leading-relaxed">
                  Thank you! Your message has been routed directly to our
                  Backstage concierge team. We will review your request and get
                  back to you shortly by email.
                </p>
                <div className="pt-4">
                  <Button
                    type="primary"
                    onClick={() => setStatus("idle")}
                    className="!rounded-xl"
                  >
                    Send another inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="border-b border-line pb-4">
                  <h2 className="font-display text-xl font-bold text-ink">
                    Submit an Inquiry
                  </h2>
                  <p className="text-xs text-ink-muted mt-1">
                    Fill out the form below and our team will get back to your
                    registered email.
                  </p>
                </div>

                {/* Formspree anti-spam & subject inputs */}
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden
                />
                <input
                  type="hidden"
                  name="_subject"
                  value={`[Showe Backstage] Support Inquiry from ${profile?.name || "Partner"}`}
                />
                <input
                  type="hidden"
                  name="organisation"
                  value={profile?.name || ""}
                />
                <input
                  type="hidden"
                  name="tier"
                  value={profile?.subscription?.name || "N/A"}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      id="inquiry-name"
                      name="name"
                      type="text"
                      required
                      defaultValue={profile?.name || ""}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-base text-ink placeholder:text-ink-faint text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                    >
                      Contact Email
                    </label>
                    <input
                      id="inquiry-email"
                      name="email"
                      type="email"
                      required
                      defaultValue={profile?.email || ""}
                      placeholder="name@organisation.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-base text-ink placeholder:text-ink-faint text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="inquiry-topic"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                    >
                      Topic
                    </label>
                    <select
                      id="inquiry-topic"
                      name="topic"
                      className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-base text-ink text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                    >
                      <option value="Programme Builder">
                        Programme Builder & Layout
                      </option>
                      <option value="Live Event / Schedule">
                        Live Event & Schedule
                      </option>
                      <option value="QR Codes & Mobile Reader">
                        Audience QR & Reader
                      </option>
                      <option value="Venues & Artists">Venues & Artists</option>
                      <option value="Billing & Subscriptions">
                        Billing, Invoices & Upgrades
                      </option>
                      <option value="General Support">
                        General Inquiry / Feedback
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-urgency"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                    >
                      Urgency
                    </label>
                    <select
                      id="inquiry-urgency"
                      name="urgency"
                      className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-base text-ink text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
                    >
                      <option value="Normal">Normal — Planning ahead</option>
                      <option value="High">High — Opening within 48h</option>
                      <option value="Critical">
                        Critical — Live show active
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="inquiry-message"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                  >
                    How can we help?
                  </label>
                  <textarea
                    id="inquiry-message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Provide details about what you need assistance with, relevant event or programme names, or questions…"
                    className="w-full px-4 py-3 rounded-xl border border-line bg-surface-base text-ink placeholder:text-ink-faint text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
                  />
                </div>

                {status === "error" && (
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed">
                    Could not submit form. Please reach out directly to{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="font-bold underline"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                    .
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-[12px] text-ink-faint flex items-center gap-1.5">
                    <Mail size={13} />
                    <span>Delivered securely to {SUPPORT_EMAIL}</span>
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={status === "sending"}
                    icon={<Send size={14} />}
                    size="large"
                    className="w-full sm:w-auto px-8 !h-11 !rounded-xl font-semibold"
                  >
                    {status === "sending"
                      ? "Sending inquiry…"
                      : "Submit inquiry"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
