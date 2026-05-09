import React from 'react';

interface FieldGroupProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({
  label,
  hint,
  required,
  children,
  className,
}: FieldGroupProps) {
  return (
    <div className={className}>
      <label className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}
