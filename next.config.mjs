/** @type {import('next').NextConfig} */

// When BUILD_STATIC=true we emit a fully static site (./out) intended to be
// hosted under a sub-folder of another site's public_html (default /calculator).
// Normal `npm run dev` / `npm run build` are unaffected so the admin/extract
// tools keep working locally.
const staticExport = process.env.BUILD_STATIC === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = staticExport
  ? {
      output: 'export',
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
