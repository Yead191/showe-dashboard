import { X } from 'lucide-react';
import { Button } from 'antd';

interface SelectedTargetCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    image: string;
    title: string;
    meta: string;
    extra: string;
    onClear: () => void;
}

export default function SelectedTargetCard({
    icon: Icon,
    image,
    title,
    meta,
    extra,
    onClear,
}: SelectedTargetCardProps) {
    return (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-line bg-surface-sunken/60">
            <img
                src={image}
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-surface-sunken shrink-0"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-primary" />
                    <span className="font-semibold text-ink truncate">{title}</span>
                </div>
                <div className="text-[12px] text-ink-faint truncate">{meta}</div>
                <div className="text-[11.5px] text-primary font-semibold mt-0.5">{extra}</div>
            </div>
            <Button
                type="text"
                size="small"
                icon={<X size={14} />}
                onClick={onClear}
                aria-label="Clear selection"
            />
        </div>
    );
}
