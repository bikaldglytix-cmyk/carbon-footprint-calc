// Register the report fonts exactly ONCE for the whole app. Registering the same
// family from multiple components races @react-pdf's loader and surfaces as
// "Could not resolve font for Inter, fontWeight 400" at render time. Both report
// templates import this module for its side effect instead of calling
// Font.register themselves.

import { Font } from '@react-pdf/renderer';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

let registered = false;

export function registerReportFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: `${basePath}/fonts/inter/Inter_18pt-Regular.ttf`, fontWeight: 400 },
      { src: `${basePath}/fonts/inter/Inter_18pt-Medium.ttf`, fontWeight: 500 },
      { src: `${basePath}/fonts/inter/Inter_18pt-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'Spectral',
    fonts: [
      { src: `${basePath}/fonts/spectral/Spectral-Regular.ttf`, fontWeight: 400 },
      { src: `${basePath}/fonts/spectral/Spectral-Italic.ttf`, fontWeight: 400, fontStyle: 'italic' },
      { src: `${basePath}/fonts/spectral/Spectral-Bold.ttf`, fontWeight: 700 },
    ],
  });

  // Stop long words / URLs from being split with hyphens.
  Font.registerHyphenationCallback((word) => [word]);
}

registerReportFonts();
