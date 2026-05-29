/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONITOR_APP_ID?: string;
  readonly VITE_MONITOR_URL?: string;
  readonly VITE_MONITOR_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
