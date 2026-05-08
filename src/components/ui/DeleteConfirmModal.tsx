import { Modal, Button } from 'antd';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  targetName?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure you want to delete this?',
  description = 'This action cannot be undone and will permanently remove the data from our servers.',
  targetName,
  confirmText = 'Delete permanently',
  cancelText = 'Cancel',
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={!loading}
      maskClosable={!loading}
      centered
      width={440}
      className="premium-modal delete-confirm-modal"
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-6 animate-pulse-subtle">
          <AlertTriangle size={32} />
        </div>

        <h3 className="font-display font-extrabold text-2xl text-ink leading-tight mb-3">
          {title}
        </h3>

        <p className="text-[15px] text-ink-muted leading-relaxed max-w-[340px]">
          {description}
          {targetName && (
            <span className="block mt-2 font-semibold text-ink">
              Target: "{targetName}"
            </span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mt-10">
          <Button
            size="large"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl h-12 font-bold border-line bg-surface-raised hover:bg-surface-sunken"
          >
            {cancelText}
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={onConfirm}
            loading={loading}
            className="rounded-xl h-12 font-bold shadow-lg shadow-error/20"
            icon={<Trash2 size={16} />}
            danger
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
