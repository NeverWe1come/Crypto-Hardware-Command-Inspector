/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

interface ImportMetaEnv {
  readonly VITE_TARGET?: string;
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
