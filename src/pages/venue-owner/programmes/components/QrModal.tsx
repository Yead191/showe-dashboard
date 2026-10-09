import { memo, useState } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Download,
  QrCode,
  ExternalLink,
  CalendarX2,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface QrModalProps {
  open: boolean;
  onCancel: () => void;
  programmeId: string;
  programmeTitle: string;
  qrCodeUrl?: string | null;
  isAssignedToEvent?: boolean;
}

export const QrModal = memo(function QrModal({
  open,
  onCancel,
  programmeId,
  programmeTitle,
  qrCodeUrl,
  isAssignedToEvent = false,
}: QrModalProps) {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const hasQrCode = Boolean(qrCodeUrl);

  const handleDownload = async () => {
    if (!qrCodeUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${(programmeTitle || "programme")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-qr.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("QR code downloaded successfully");
    } catch {
      window.open(qrCodeUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={440}
      className="premium-modal"
    >
      {hasQrCode ? (
        <div className="text-center pb-3 pt-2">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3 shadow-xs border border-primary/20">
            <QrCode size={28} strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-display font-extrabold text-ink mb-1.5 tracking-tight">
            Scan Programme
          </h3>
          <p className="text-sm text-ink-muted mb-6 px-4">
            Scan this QR code to instantly access{" "}
            <strong className="text-ink">{programmeTitle}</strong> on any device.
          </p>

          <div className="bg-white p-5 rounded-3xl border border-line/60 inline-block shadow-soft relative overflow-hidden group/qr">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
            <img
              src={qrCodeUrl!}
              alt={`${programmeTitle} QR Code`}
              className="w-48 h-48 object-contain relative z-10 transition-transform duration-500 group-hover/qr:scale-105"
            />
          </div>

          <p className="text-[11px] text-ink-faint mt-3">
            Compatible with any native camera or QR scanner
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <Button
              icon={<Download size={14} />}
              className="flex-1 h-11 rounded-xl font-semibold hover:bg-surface-sunken"
              onClick={handleDownload}
              loading={isDownloading}
            >
              Download QR
            </Button>
            <Button
              type="primary"
              className="flex-1 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
              onClick={() => window.open(`/reader/${programmeId}`, "_blank")}
              icon={<ExternalLink size={14} />}
            >
              Open Reader
            </Button>
            <Button
              className="h-11 rounded-xl font-semibold hover:bg-surface-sunken px-4"
              onClick={onCancel}
            >
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center pb-3 pt-2">
          <div className="mx-auto w-14 h-14 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-3 shadow-xs border border-amber-500/20">
            <CalendarX2 size={26} strokeWidth={2} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {isAssignedToEvent ? "QR Generating" : "Not Assigned to Any Event"}
          </div>

          <h3 className="text-2xl font-display font-extrabold text-ink mb-1.5 tracking-tight">
            QR Code Not Available
          </h3>
          <p className="text-sm text-ink-muted mb-5 px-3 leading-relaxed">
            This programme is not currently assigned to an event. A unique QR code is automatically generated once the programme is linked to an active event.
          </p>

          <div className="bg-surface-sunken/80 rounded-2xl p-4 border border-line text-left mb-6 space-y-2">
            <div className="flex items-start gap-2.5">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-ink-muted leading-relaxed">
                <span className="font-semibold text-ink block mb-0.5">
                  How to generate this QR code:
                </span>
                Go to <span className="font-semibold text-ink">Events</span>, open or create an event, and link <span className="font-semibold text-ink">"{programmeTitle}"</span> under the Programmes tab.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <Button
              type="primary"
              className="flex-1 h-11 rounded-xl font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
              onClick={() => {
                onCancel();
                navigate("/owner/events");
              }}
            >
              <span>Go to Events</span>
              <ArrowRight size={14} />
            </Button>
            <Button
              className="h-11 rounded-xl font-semibold hover:bg-surface-sunken flex items-center justify-center gap-1.5"
              onClick={() => window.open(`/reader/${programmeId}`, "_blank")}
            >
              <ExternalLink size={14} />
              <span>Preview Reader</span>
            </Button>
            <Button
              className="h-11 rounded-xl font-semibold hover:bg-surface-sunken px-4"
              onClick={onCancel}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
});
