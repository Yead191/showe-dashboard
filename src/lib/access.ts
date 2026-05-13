import type { VenueTier } from '@/types/auth';
import { TIER_META } from '@/constants/tiers';
import type { AddOn, CapabilityKey } from '@/constants/addons';

/**
 * Combined access set for a user — tier modules union'd with modules unlocked via active add-ons.
 * Use this anywhere feature code asks "does this user have module X?".
 */
export function getEffectiveModules(tier: VenueTier, activeAddOns: AddOn[]): Set<number> {
  const fromTier = TIER_META[tier]?.modules ?? [];
  const fromAddOns = activeAddOns
    .map((a) => a.linkedModule)
    .filter((m): m is number => typeof m === 'number');
  return new Set([...fromTier, ...fromAddOns]);
}

/**
 * Stable capability check — string keys outlive module renumbering and label changes.
 * An add-on confers its `capabilityKey` while active; a module confers nothing by itself
 * unless it maps to a known capability via the seed below.
 */
const MODULE_CAPABILITIES: Record<number, CapabilityKey[]> = {
  7: ['sponsored_listings'],
  9: ['push_notifications'],
};

export function hasCapability(
  tier: VenueTier,
  activeAddOns: AddOn[],
  key: CapabilityKey
): boolean {
  if (activeAddOns.some((a) => a.capabilityKey === key)) return true;
  const modules = TIER_META[tier]?.modules ?? [];
  return modules.some((m) => MODULE_CAPABILITIES[m]?.includes(key));
}

/**
 * Whether an add-on is offered to a venue on a given tier. Honours admin gating.
 */
export function isAddOnAvailable(addon: AddOn, tier: VenueTier): boolean {
  if (addon.status === 'archived') return false;
  if (addon.availableOn === 'all') return true;
  return addon.availableOn.includes(tier);
}

/**
 * True when the tier already grants the add-on's linked module — used to render
 * "Included in your tier" rather than a buy button.
 */
export function isAddOnIncludedInTier(addon: AddOn, tier: VenueTier): boolean {
  if (!addon.linkedModule) return false;
  return (TIER_META[tier]?.modules ?? []).includes(addon.linkedModule);
}
