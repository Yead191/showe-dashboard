import { Input } from 'antd';

interface ColorPickerFieldProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function ColorPickerField({ value = '#014B52', onChange }: ColorPickerFieldProps) {
    return (
        <div className="flex gap-2 items-center">
            <input
                type="color"
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className="w-10 h-10 p-1 rounded-lg border border-line bg-surface-raised cursor-pointer shrink-0"
            />
            <Input
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                placeholder="#014B52"
                className="input-base font-mono text-xs"
            />
        </div>
    );
}
