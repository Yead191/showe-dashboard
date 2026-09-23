import { useState, useMemo, useEffect } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { Button, Skeleton, Modal, Tag, Tooltip } from "antd";
import {
  Save,
  Eye,
  Clock,
  Globe,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Printer,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useGetDisclaimerQuery,
  useUpsertDisclaimerMutation,
} from "@/store/api/admin/disclaimer/disclaimerApi";
import type { DisclaimerType } from "@/store/api/admin/disclaimer/disclaimer.types";
import {
  getDisclaimerConfig,
  isDisclaimerType,
  DISCLAIMER_PAGES,
  type DisclaimerPageConfig,
} from "./disclaimerConfig";
import { RichTextEditor } from "./RichTextEditor";

const EMPTY_CONTENT = "<p></p>";

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function getCharacterCount(html: string): number {
  return html.replace(/<[^>]*>/g, "").trim().length;
}

function DisclaimerEditor({
  type,
  config,
}: {
  type: DisclaimerType;
  config: DisclaimerPageConfig;
}) {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError } = useGetDisclaimerQuery({
    type,
  });
  const [upsertDisclaimer, { isLoading: isSaving }] =
    useUpsertDisclaimerMutation();

  const [draft, setDraft] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );

  // Reset local draft when switching documents
  useEffect(() => {
    setDraft(null);
  }, [type]);

  const loading = isLoading || isFetching;
  const savedContent = loading
    ? null
    : isError
      ? EMPTY_CONTENT
      : data?.data?.trim() || EMPTY_CONTENT;

  const content = draft !== null ? draft : (savedContent ?? EMPTY_CONTENT);
  const isDirty = draft !== null && draft !== savedContent;
  const Icon = config.icon;

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const charCount = useMemo(() => getCharacterCount(content), [content]);
  const readingTime = useMemo(
    () => `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    [wordCount]
  );

  const handleSave = async () => {
    try {
      await upsertDisclaimer({ type, content }).unwrap();
      setDraft(null);
      toast.success("Document published successfully", {
        description: `${config.title} is now updated and published live across SHOWE platforms.`,
      });
    } catch (error) {
      toast.error("Failed to publish document", {
        description: getApiErrorMessage(error, "Please check your network and try again."),
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.title} — SHOWE</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            h1 { color: #014B52; border-bottom: 2px solid #EBE7DF; padding-bottom: 12px; }
            blockquote { border-left: 4px solid #014B52; padding-left: 16px; margin: 16px 0; color: #555; }
            hr { border: 0; border-top: 1px solid #ddd; margin: 24px 0; }
          </style>
        </head>
        <body>
          <h1>${config.title}</h1>
          <p><em>SHOWE Official Legal Policy · Last updated ${new Date().toLocaleDateString()}</em></p>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* ── Document Switcher Header ── */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {DISCLAIMER_PAGES.map((page) => {
            const isActive = page.type === type;
            const PageIcon = page.icon;

            return (
              <button
                key={page.type}
                type="button"
                onClick={() => navigate(page.path)}
                className={`relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-md ring-2 ring-primary/20"
                    : "bg-surface-raised border-line text-ink hover:border-line-strong hover:bg-surface-sunken/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : page.audience === "user"
                            ? "bg-info/10 text-info"
                            : page.audience === "organization"
                              ? "bg-accent/15 text-accent-700"
                              : "bg-primary/10 text-primary"
                      }`}
                    >
                      {page.audienceLabel}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-surface-offset text-primary"
                      }`}
                    >
                      <PageIcon size={16} />
                    </div>
                    <span
                      className={`text-sm font-bold leading-tight ${
                        isActive ? "text-white" : "text-ink"
                      }`}
                    >
                      {page.shortLabel}
                    </span>
                  </div>
                </div>

                <div
                  className={`mt-3 pt-2 text-[11px] border-t flex items-center justify-between ${
                    isActive
                      ? "border-white/15 text-white/80"
                      : "border-line text-ink-faint"
                  }`}
                >
                  <span>{page.publicUrl}</span>
                  {isActive && isDirty && (
                    <span className="text-[10px] font-bold text-accent">
                      ● Modified
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Document Management Panel ── */}
      <Panel className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-line pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-soft ring-1 ring-black/5">
              <Icon size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow text-primary">
                  Legal Compliance
                </span>
                <span className="text-ink-faint">/</span>
                <span className="text-xs font-semibold text-ink-muted">
                  {config.audienceLabel}
                </span>
                {isDirty && (
                  <Tag className="rounded-full bg-accent-50 border-accent/40 text-accent-700 text-[11px] font-semibold">
                    Unsaved Draft
                  </Tag>
                )}
              </div>
              <h2 className="mt-1 text-2xl font-bold font-display tracking-tight text-ink">
                {config.title}
              </h2>
              <p className="mt-1 max-w-2xl text-xs md:text-sm text-ink-muted">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="default"
              icon={<Eye size={15} />}
              onClick={() => setPreviewOpen(true)}
              className="h-10 rounded-xl font-medium border-line text-ink hover:text-primary hover:border-primary"
            >
              Public Preview
            </Button>

            <Button
              type="primary"
              icon={<Save size={15} />}
              loading={isSaving}
              disabled={!isDirty || loading}
              onClick={handleSave}
              className="h-10 rounded-xl bg-primary! text-white! font-semibold shadow-soft px-5"
            >
              Publish Live
            </Button>
          </div>
        </div>

        {/* ── Metadata & Status Strip ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 pb-2 text-xs text-ink-muted">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-ink">
              <CheckCircle2 size={14} className="text-success" />
              <span>Status: Live on Website & App</span>
            </div>
            <span className="text-line-divider">|</span>
            <div className="flex items-center gap-1.5 text-ink-muted">
              <span>{wordCount} words</span>
              <span>·</span>
              <span>{charCount} characters</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {readingTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe size={13} className="text-primary" />
            <span>Public route:</span>
            <code className="rounded-md bg-surface-sunken border border-line px-2 py-0.5 font-mono text-[11.5px] text-ink font-semibold">
              {config.publicUrl}
            </code>
            <Tooltip title="View public location">
              <a
                href={config.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink-faint hover:text-primary transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            </Tooltip>
          </div>
        </div>

        {/* ── Empty notice ── */}
        {isError && !isDirty && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-3.5 text-xs text-warning-800">
            <AlertCircle size={16} className="text-warning shrink-0" />
            <span>
              No published content was found for this policy. Start drafting
              below and click <strong>Publish Live</strong> to make it accessible to
              users.
            </span>
          </div>
        )}

        {/* ── Main Editor Canvas ── */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-4 py-8">
              <Skeleton active paragraph={{ rows: 3 }} />
              <div className="h-96 rounded-2xl bg-surface-sunken animate-pulse" />
            </div>
          ) : (
            <RichTextEditor
              key={type}
              value={content}
              onChange={setDraft}
              placeholder={`Draft official ${config.title.toLowerCase()} for the SHOWE platform...`}
              disabled={isSaving}
              minHeight={520}
            />
          )}
        </div>
      </Panel>

      {/* ── Public Live Preview Modal ── */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <div key="footer-actions" className="flex items-center justify-between w-full">
            <Button
              key="print"
              icon={<Printer size={14} />}
              onClick={handlePrint}
              className="rounded-xl"
            >
              Print / PDF
            </Button>
            <div className="flex items-center gap-2">
              <Button
                key="close"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl"
              >
                Close
              </Button>
              {isDirty && (
                <Button
                  key="save"
                  type="primary"
                  icon={<Save size={14} />}
                  loading={isSaving}
                  onClick={async () => {
                    await handleSave();
                    setPreviewOpen(false);
                  }}
                  className="rounded-xl bg-primary! text-white!"
                >
                  Publish Changes Now
                </Button>
              )}
            </div>
          </div>,
        ]}
        width={previewDevice === "mobile" ? 480 : 860}
        destroyOnClose
        centered
        title={
          <div className="flex items-center justify-between border-b border-line pb-3 pr-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-ink">
                  {config.title}
                </h3>
                <p className="text-xs text-ink-muted">
                  SHOWE Live Website & App Simulation · {readingTime}
                </p>
              </div>
            </div>

            {/* Device Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-surface-sunken p-1 rounded-xl border border-line">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  previewDevice === "desktop"
                    ? "bg-surface-raised shadow-xs text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Laptop size={13} />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  previewDevice === "mobile"
                    ? "bg-surface-raised shadow-xs text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Smartphone size={13} />
                <span>Mobile</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="max-h-[68vh] overflow-y-auto py-4 px-1">
          <div
            className={`mx-auto rounded-2xl border border-line bg-surface-raised shadow-soft transition-all ${
              previewDevice === "mobile"
                ? "max-w-sm p-5 border-2 border-line-strong rounded-3xl"
                : "p-8 md:p-10"
            }`}
          >
            {/* Header simulation */}
            <div className="mb-6 border-b border-line pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  SHOWE Official Policy
                </span>
                <span className="text-xs text-ink-faint">
                  Route: {config.publicUrl}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-primary">
                {config.title}
              </h1>
              <p className="mt-2 text-xs text-ink-muted flex items-center gap-2">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <span>·</span>
                <span>{wordCount} words</span>
                <span>·</span>
                <span>Audience: {config.audienceLabel}</span>
              </p>
            </div>

            {/* Document Body */}
            <div
              className="showe-prose text-[14.5px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Simulated footer */}
            <div className="mt-12 pt-6 border-t border-line text-center text-xs text-ink-faint">
              <p>© {new Date().getFullYear()} SHOWE. All rights reserved.</p>
              <p className="mt-1 text-[11px]">
                Questions regarding this policy? Contact compliance@showe.io
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DisclaimerEditorPage() {
  const { type } = useParams<{ type: string }>();
  const activeType = type || "terms-user";
  const config = getDisclaimerConfig(activeType);

  if (!isDisclaimerType(activeType) || !config) {
    return <Navigate to="/admin/disclaimer/terms-user" replace />;
  }

  // If accessed via an alias like /user-terms, redirect to canonical path
  if (type && type !== config.type) {
    return <Navigate to={config.path} replace />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Legal & Policies"
        description="Review, edit, and publish official terms of service, privacy policies, and compliance guidelines across SHOWE."
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-muted px-3 py-1.5 rounded-xl bg-surface-sunken border border-line">
              <Sparkles size={13} className="text-accent-500" />
              Real-time sync to public storefront
            </span>
          </div>
        }
      />

      <DisclaimerEditor key={config.type} type={config.type} config={config} />
    </>
  );
}
