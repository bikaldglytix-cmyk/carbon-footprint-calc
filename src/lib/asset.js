// Prefix public assets (images referenced by absolute path) with the configured
// base path, so they resolve when the app is hosted under a sub-folder such as
// /calculator. In dev / normal builds NEXT_PUBLIC_BASE_PATH is empty, so this is
// a no-op and assets resolve from the site root as before.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function asset(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${p}`;
}
