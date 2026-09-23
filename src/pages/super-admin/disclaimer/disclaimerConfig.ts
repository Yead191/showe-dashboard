import type { LucideIcon } from "lucide-react";
import { UserCheck, ShieldCheck, Building2, Lock, Info } from "lucide-react";
import type { DisclaimerType } from "@/store/api/admin/disclaimer/disclaimer.types";

export type DisclaimerAudience = "user" | "organization" | "general";

export interface DisclaimerPageConfig {
  type: DisclaimerType;
  path: string;
  publicUrl: string;
  audience: DisclaimerAudience;
  audienceLabel: string;
  label: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

const ALIAS_MAP: Record<string, DisclaimerType> = {
  "user-terms": "terms-user",
  terms: "terms-user",
  "user-privacy": "privacy-user",
  privacy: "privacy-user",
  "organization-terms": "terms-organization",
  "vendor-terms": "terms-organization",
  "org-terms": "terms-organization",
  "organization-privacy": "privacy-organization",
  "org-privacy": "privacy-organization",
};

export const DISCLAIMER_PAGES: DisclaimerPageConfig[] = [
  {
    type: "terms-user",
    path: "/admin/disclaimer/terms-user",
    publicUrl: "/terms",
    audience: "user",
    audienceLabel: "End Users",
    label: "User Terms & Conditions",
    shortLabel: "User Terms",
    title: "User Terms & Conditions",
    subtitle:
      "Platform rules, code of conduct, ticket purchasing, and account policies for SHOWE audience members and visitors.",
    description:
      "Governs consumer access to event listings, digital programmes, interactive features, and ticketing services.",
    icon: UserCheck,
  },
  {
    type: "privacy-user",
    path: "/admin/disclaimer/privacy-user",
    publicUrl: "/privacy",
    audience: "user",
    audienceLabel: "End Users",
    label: "User Privacy Policy",
    shortLabel: "User Privacy",
    title: "User Privacy Policy",
    subtitle:
      "Transparent privacy standards explaining how SHOWE collects, secures, and handles user account data and cookies.",
    description:
      "Outlines personal data protection, telemetry disclosures, communication consent, and user privacy rights.",
    icon: ShieldCheck,
  },
  {
    type: "terms-organization",
    path: "/admin/disclaimer/terms-organization",
    publicUrl: "/organization-terms",
    audience: "organization",
    audienceLabel: "Organisations",
    label: "Organization Terms & Conditions",
    shortLabel: "Org Terms",
    title: "Organization Terms & Conditions",
    subtitle:
      "Commercial service terms, venue onboarding, programme publication rights, and billing policies for venue partners.",
    description:
      "Governs organisation accounts, ticket revenue processing, tier subscriptions, and digital programme publication.",
    icon: Building2,
  },
  {
    type: "privacy-organization",
    path: "/admin/disclaimer/privacy-organization",
    publicUrl: "/organization-privacy",
    audience: "organization",
    audienceLabel: "Organisations",
    label: "Organization Privacy Policy",
    shortLabel: "Org Privacy",
    title: "Organization Privacy Policy",
    subtitle:
      "Governance standards for venue proprietary data, attendee analytics access, and compliance protocols.",
    description:
      "Outlines confidentiality standards, data processing obligations, and safeguarding of customer analytics.",
    icon: Lock,
  },
  {
    type: "about",
    path: "/admin/disclaimer/about",
    publicUrl: "/about",
    audience: "general",
    audienceLabel: "Platform",
    label: "About SHOWE",
    shortLabel: "About Us",
    title: "About SHOWE",
    subtitle:
      "Platform mission, company heritage, community vision, and editorial overview shown to visitors across web & mobile.",
    description:
      "Public brand manifesto, story, and ecosystem details published on the official SHOWE About Us destination.",
    icon: Info,
  },
];

export function getDisclaimerConfig(
  type: string | undefined,
): DisclaimerPageConfig | undefined {
  if (!type) return DISCLAIMER_PAGES[0];
  const resolvedType = ALIAS_MAP[type] || type;
  return DISCLAIMER_PAGES.find((page) => page.type === resolvedType);
}

export function isDisclaimerType(
  value: string | undefined,
): value is DisclaimerType {
  if (!value) return false;
  if (value in ALIAS_MAP) return true;
  return DISCLAIMER_PAGES.some((page) => page.type === value);
}
