import {
    Megaphone,
    BellRing,
    Database,
    Sparkles,
    ShieldCheck,
} from 'lucide-react';
import type { ComponentType } from 'react';

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

/**
 * String→component map for add-on icons. Keep this in a non-component module so
 * Vite/HMR fast-refresh isn't broken (components must only export components).
 */
export const ADDON_ICONS: Record<string, IconComponent> = {
    Megaphone,
    BellRing,
    Database,
    Sparkles,
    ShieldCheck,
};
