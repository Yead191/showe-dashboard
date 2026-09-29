/// <reference types="vite/client" />

declare module '*.css';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WEBSITE_URL?: string;
  readonly VITE_FORMSPREE_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
