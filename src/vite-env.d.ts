/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site URL, set in vite.config.ts from SITE_URL or Netlify's URL. */
  readonly VITE_SITE_URL: string;
}
