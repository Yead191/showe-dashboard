import { useEffect, useRef, useState } from 'react';
import type { BlockAnimation, AnimationType } from '@/types/programme';

/**
 * For a given animation type, return CSS transform/opacity for the "before" state.
 * The "after" state is always { opacity:1, transform:none }.
 */
export function getInitialStyles(type: AnimationType): React.CSSProperties {
  switch (type) {
    case 'fade_in':
      return { opacity: 0 };
    case 'slide_up':
      return { opacity: 0, transform: 'translateY(24px)' };
    case 'slide_in_right':
      return { opacity: 0, transform: 'translateX(24px)' };
    case 'scale_in':
      return { opacity: 0, transform: 'scale(0.96)' };
    case 'parallax':
      return { opacity: 0, transform: 'translateY(40px)' };
    case 'tap_expand':
    case 'none':
    default:
      return {};
  }
}

/** Hook: reveal-on-scroll-into-view for a single element. */
export function useReveal(animation: BlockAnimation): {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
} {
  const ref = useRef<HTMLDivElement>(null!);
  const [revealed, setRevealed] = useState(animation.type === 'none' || animation.type === 'tap_expand');

  useEffect(() => {
    if (animation.type === 'none' || animation.type === 'tap_expand') {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [animation.type]);

  const initial = getInitialStyles(animation.type);
  const style: React.CSSProperties = revealed
    ? {
        opacity: 1,
        transform: 'none',
        transition: `opacity ${animation.duration_ms}ms cubic-bezier(0.16, 1, 0.3, 1) ${animation.delay_ms}ms, transform ${animation.duration_ms}ms cubic-bezier(0.16, 1, 0.3, 1) ${animation.delay_ms}ms`,
      }
    : {
        ...initial,
        transition: `opacity ${animation.duration_ms}ms cubic-bezier(0.16, 1, 0.3, 1) ${animation.delay_ms}ms, transform ${animation.duration_ms}ms cubic-bezier(0.16, 1, 0.3, 1) ${animation.delay_ms}ms`,
      };

  return { ref, style };
}

/** A label for use in dropdowns. */
export const ANIMATION_LABELS: Record<AnimationType, string> = {
  none: 'No animation',
  fade_in: 'Fade in',
  slide_up: 'Slide up',
  slide_in_right: 'Slide in (right)',
  scale_in: 'Scale in',
  parallax: 'Parallax reveal',
  tap_expand: 'Tap to expand',
};

export const ANIMATION_TYPES: AnimationType[] = [
  'none',
  'fade_in',
  'slide_up',
  'slide_in_right',
  'scale_in',
  'parallax',
  'tap_expand',
];
