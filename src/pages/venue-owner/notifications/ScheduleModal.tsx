import { useState } from 'react';
import { Modal, DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { Calendar, Clock, AlertCircle, Smartphone, Globe, Layers, MousePointerClick } from 'lucide-react';
import { toast } from 'sonner';
import {
  PLATFORM_META,
  type NotificationPlatform,
} from '@/constants/notifications';

const PLATFORM_ICONS = { Smartphone, Globe, Layers } as const;

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: dayjs.Dayjs) => void;
  title: string;
  body: string;
  platform: NotificationPlatform;
  destinationScreen: string | null;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  title,
  body,
  platform,
  destinationScreen,
}: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const isValid = !!title.trim() && !!body.trim() && !!selectedDate;

  const platformMeta = PLATFORM_META[platform];
  const PlatformIcon = PLATFORM_ICONS[platformMeta.icon as keyof typeof PLATFORM_ICONS];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#014B52',
          borderRadius: 12,
        },
      }}
    >
      <Modal
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-base font-bold text-ink">Schedule Notification</div>
              <div className="text-[12px] font-medium text-ink-faint">Pick a time to reach your audience</div>
            </div>
          </div>
        }
        open={isOpen}
        onCancel={onClose}
        onOk={() => {
          if (selectedDate) {
            onSchedule(selectedDate);
            toast.success(`Scheduled for ${selectedDate.format('MMM D, HH:mm')}`);
            setSelectedDate(null);
            onClose();
          }
        }}
        okText="Schedule Message"
        cancelText="Discard"
        okButtonProps={{
          className: 'h-11 px-6 rounded-full font-bold',
          disabled: !isValid
        }}
        cancelButtonProps={{ className: 'h-11 px-6 rounded-full font-semibold' }}

        width={440}
        className="premium-modal"

      >
        <div className="py-6">

          <div className="space-y-4">
            <div>
              <label className="field-label flex items-center gap-2">
                <Clock size={12} />
                Delivery Time
              </label>
              <DatePicker
                showTime
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full h-12 rounded-xl border-line hover:border-primary focus:border-primary shadow-none"
                placeholder="Select date and time"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </div>

            <p className="text-[12px] text-ink-faint leading-relaxed italic">
              * Notifications are delivered based on the user's local timezone to ensure maximum engagement.
            </p>
          </div>
          {!title.trim() || !body.trim() ? (
            <div className="p-4 rounded-2xl bg-danger/5 border border-danger/10 flex gap-3 mb-6">
              <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger leading-relaxed">
                Please add a <strong>title and body</strong> to your notification before scheduling.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-sunken border border-line mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">Previewing</div>
              <div className="text-sm font-bold text-ink truncate">{title}</div>
              <div className="text-sm text-ink-muted line-clamp-2 mt-0.5">{body}</div>
              <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-surface-raised border border-line text-[11px] font-bold text-ink-muted">
                  <PlatformIcon size={11} className="text-primary" />
                  {platformMeta.label}
                </span>
                {destinationScreen && (
                  <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary">
                    <MousePointerClick size={11} />
                    <span className="font-mono">{destinationScreen}</span>
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </Modal>
    </ConfigProvider>
  );
}
