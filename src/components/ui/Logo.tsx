import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
}

export function Logo({ className }: LogoProps) {

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <img src="/logo.png" alt="" className={cn('object-contain w-full h-12')} />
    </div>
  );
}
