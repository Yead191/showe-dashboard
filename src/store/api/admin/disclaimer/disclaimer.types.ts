export type DisclaimerType =
  | "about"
  | "terms-user"
  | "terms-organization"
  | "privacy-user"
  | "privacy-organization"
  // Backwards compatibility aliases
  | "user-terms"
  | "user-privacy"
  | "organization-terms"
  | "organization-privacy"
  | "privacy"
  | "vendor-terms"
  | "refund";

export interface GetDisclaimerParams {
  type: DisclaimerType;
}

export interface DisclaimerResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface UpsertDisclaimerPayload {
  type: DisclaimerType;
  content: string;
}

export interface DisclaimerMutationResponse {
  success: boolean;
  message: string;
  data?: string;
}
