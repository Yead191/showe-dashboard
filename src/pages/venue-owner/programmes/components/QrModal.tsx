import { memo } from 'react';
import { Modal, Button } from 'antd';
import { Download, QrCode } from 'lucide-react';

interface QrModalProps {
    open: boolean;
    onCancel: () => void;
    programmeId: string;
    programmeTitle: string;
}

export const QrModal = memo(function QrModal({ open, onCancel, programmeId, programmeTitle }: QrModalProps) {
    const qrImageUrl = '/assets/qr-codes/demo-qr.png';

    return (
        <Modal open={open} onCancel={onCancel} footer={null} centered width={410} className="premium-modal">
            <div className="text-center pb-4 pt-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-sm">
                    <QrCode size={32} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-display font-extrabold text-ink mb-2 tracking-tight">Scan Programme</h3>
                <p className="text-sm text-ink-muted mb-8 px-4">
                    Scan this QR code to instantly access <strong className="text-ink">{programmeTitle}</strong> on any device.
                </p>
                <div className="bg-surface-sunken p-6 rounded-3xl border border-line/60 inline-block shadow-soft relative overflow-hidden group/qr">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
                    <img
                        src={qrImageUrl}
                        alt="Programme QR Code"
                        className="w-48 h-48 object-contain relative z-10 mix-blend-multiply transition-transform duration-500 group-hover/qr:scale-105"
                    />
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                    <Button
                        icon={<Download size={14} />}
                        className="flex-1 h-11 rounded-xl font-semibold hover:bg-surface-sunken"
                        href={qrImageUrl}
                        target="_blank"
                        download={`${programmeTitle || 'programme'}-qr.png`}
                    >
                        Download QR
                    </Button>
                    <Button
                        type="primary"
                        className="flex-1 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20"
                        onClick={() => window.open(`/reader/${programmeId}`, '_blank')}
                    >
                        Open Reader
                    </Button>
                    <Button className="flex-1 h-11 rounded-xl font-semibold hover:bg-surface-sunken" onClick={onCancel}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
});
