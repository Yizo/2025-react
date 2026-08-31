/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_API_BASE_URL?: string;
  readonly VITE_ADMIN_API_TARGET?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TARGET?: string;
  readonly VITE_MONITOR_APP_ID?: string;
  readonly VITE_MONITOR_INGEST_KEY?: string;
  readonly VITE_MONITOR_RELEASE?: string;
  readonly VITE_MONITOR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
