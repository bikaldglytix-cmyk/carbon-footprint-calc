import React from 'react';
import { Svg, Circle, Polygon, Path } from '@react-pdf/renderer';

// Shared tier badges — used by BOTH the certificate (CertificatePDF) and the editorial
// report (ClimateReportPDF) so the emblem is guaranteed identical in both. Each badge is
// drawn in a 130×150 viewBox; pass `col` (the tier colour) and optional width/height.

const WHITE = '#FFFFFF';

const hexPoints = (cx, cy, r, flat = false) => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i + (flat ? 0 : -30));
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
};

const Frame = ({ col }) => (
  <>
    <Path d="M47 104 L39 150 L60 134 L66 114 Z" fill={col} />
    <Path d="M83 104 L91 150 L70 134 L64 114 Z" fill={col} />
    <Path d="M47 104 L39 150 L52 140 L56 110 Z" fill="#000" opacity={0.18} />
    <Path d="M83 104 L91 150 L78 140 L74 110 Z" fill="#000" opacity={0.18} />
    <Circle cx={65} cy={60} r={54} fill="none" stroke={col} strokeWidth={1} opacity={0.45} />
    {Array.from({ length: 44 }).map((_, i) => {
      const a = (i / 44) * 2 * Math.PI;
      return <Circle key={i} cx={(65 + 50 * Math.cos(a)).toFixed(2)} cy={(60 + 50 * Math.sin(a)).toFixed(2)} r={0.9} fill={col} />;
    })}
  </>
);

const BadgeGuardian = ({ col, width = 120, height = 138 }) => (
  <Svg width={width} height={height} viewBox="0 0 130 150">
    <Frame col={col} />
    <Circle cx={65} cy={60} r={42} fill={col} />
    <Circle cx={65} cy={60} r={34} fill="none" stroke={WHITE} strokeWidth={1} opacity={0.55} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return <Path key={deg} d={`M ${(65 + 20 * Math.cos(r)).toFixed(1)} ${(60 + 20 * Math.sin(r)).toFixed(1)} L ${(65 + 30 * Math.cos(r)).toFixed(1)} ${(60 + 30 * Math.sin(r)).toFixed(1)}`} stroke={WHITE} strokeWidth={1.6} opacity={0.85} />;
    })}
    <Circle cx={65} cy={60} r={7} fill={WHITE} />
    <Circle cx={65} cy={60} r={3.5} fill={col} />
  </Svg>
);

const BadgeSteward = ({ col, width = 120, height = 138 }) => (
  <Svg width={width} height={height} viewBox="0 0 130 150">
    <Frame col={col} />
    <Polygon points={hexPoints(65, 60, 44, true)} fill={col} />
    <Polygon points={hexPoints(65, 60, 35, true)} fill="none" stroke={WHITE} strokeWidth={1} opacity={0.5} />
    <Path d="M65 38 C86 47 88 70 65 82 C42 70 44 47 65 38Z" fill={WHITE} opacity={0.95} />
    <Path d="M65 38 L65 82" stroke={col} strokeWidth={1.4} />
    <Path d="M65 50 C71 48 75 52 71 56" stroke={col} strokeWidth={1} fill="none" />
    <Path d="M65 60 C59 58 55 62 59 66" stroke={col} strokeWidth={1} fill="none" />
  </Svg>
);

const BadgeChallenger = ({ col, width = 120, height = 138 }) => (
  <Svg width={width} height={height} viewBox="0 0 130 150">
    <Frame col={col} />
    <Path d="M65 18 L106 38 L106 74 C106 98 65 116 65 116 C65 116 24 98 24 74 L24 38 Z" fill={col} />
    <Path d="M65 28 L98 44 L98 72 C98 92 65 107 65 107 C65 107 32 92 32 72 L32 44 Z" fill="none" stroke={WHITE} strokeWidth={1} opacity={0.45} />
    <Path d="M74 38 L57 70 L68 70 L56 100 L77 64 L66 64 Z" fill={WHITE} opacity={0.96} />
  </Svg>
);

const BadgeCatalyst = ({ col, width = 120, height = 138 }) => (
  <Svg width={width} height={height} viewBox="0 0 130 150">
    <Frame col={col} />
    <Polygon points="65,18 110,60 65,102 20,60" fill={col} />
    <Polygon points="65,30 98,60 65,90 32,60" fill="none" stroke={WHITE} strokeWidth={1} opacity={0.45} />
    <Path d="M65 38 C65 38 81 54 81 70 C81 81 74 88 65 88 C56 88 49 81 49 70 C49 54 65 38 65 38Z" fill={WHITE} opacity={0.95} />
    <Path d="M65 54 C65 54 73 63 73 71 C73 77 69 81 65 81 C61 81 57 77 57 71 C57 63 65 54 65 54Z" fill={col} opacity={0.75} />
  </Svg>
);

const BadgeLeader = ({ col, width = 120, height = 138 }) => {
  const oct = (cx, cy, r) => Array.from({ length: 8 }).map((_, i) => { const a = (Math.PI / 180) * (45 * i - 22.5); return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; }).join(' ');
  return (
    <Svg width={width} height={height} viewBox="0 0 130 150">
      <Frame col={col} />
      <Polygon points={oct(65, 60, 44)} fill={col} />
      <Polygon points={oct(65, 60, 35)} fill="none" stroke={WHITE} strokeWidth={1} opacity={0.45} />
      <Path d="M65 32 L77 58 L70 58 L70 92 L60 92 L60 58 L53 58 Z" fill={WHITE} opacity={0.96} />
    </Svg>
  );
};

export const TIER_BADGE_KEY = {
  'CLIMATE GUARDIAN': 'guardian',
  'CLIMATE STEWARD': 'steward',
  'CLIMATE CHALLENGER': 'challenger',
  'CLIMATE CATALYST': 'catalyst',
  'CLIMATE LEADER IN TRANSITION': 'leader',
};

const BADGE_MAP = { guardian: BadgeGuardian, steward: BadgeSteward, challenger: BadgeChallenger, catalyst: BadgeCatalyst, leader: BadgeLeader };

export function TierBadge({ title, badgeKey, col, width, height }) {
  const Comp = BADGE_MAP[badgeKey || TIER_BADGE_KEY[title]] || BadgeSteward;
  return <Comp col={col} width={width} height={height} />;
}
