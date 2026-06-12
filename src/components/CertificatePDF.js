import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Rect, Polygon, Circle, Path } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { buildReportModel } from '../lib/reportModel';
import { registerReportFonts } from '../lib/reportFonts';
import { TierBadge } from './TierBadges';

/* ---------------- PALETTE ---------------- */
const c = {
  page: '#F6F4EC',
  ink: '#23271F',       // dark sidebar
  inkSoft: '#2E332A',
  body: '#4A504B',
  sub: '#6C6F63',
  faint: '#B7B6A6',
  line: '#E2DECF',
  accent: '#9BB62B',
  accentText: '#74901C',
  white: '#FFFFFF',
  // tier colours
  platinum: '#9BAAB8',
  green: '#6F9A2E',
  blue: '#3A72B0',
  orange: '#C47318',
  red: '#B0402C',
};

// Map the model's tier title → certificate colour + badge key.
const TIER_META = {
  'CLIMATE GUARDIAN': { color: c.platinum, key: 'guardian' },
  'CLIMATE STEWARD': { color: c.green, key: 'steward' },
  'CLIMATE CHALLENGER': { color: c.blue, key: 'challenger' },
  'CLIMATE CATALYST': { color: c.orange, key: 'catalyst' },
  'CLIMATE LEADER IN TRANSITION': { color: c.red, key: 'leader' },
};
const titleCase = (str) => String(str).toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());

/* ---------------- QR (dark modules on white chip) ---------------- */
function QrDark({ value, size = 56 }) {
  let matrix = null, n = 0;
  try { const qr = QRCode.create(value, { errorCorrectionLevel: 'M' }); matrix = qr.modules.data; n = qr.modules.size; }
  catch { return <View style={{ width: size, height: size }} />; }
  const rects = [];
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) if (matrix[r * n + col]) rects.push(<Rect key={`${r}-${col}`} x={col} y={r} width={1.04} height={1.04} fill={c.ink} />);
  return <Svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}>{rects}</Svg>;
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: c.page, fontFamily: 'Inter', color: c.body },

  // LEFT content column
  left: { width: '68%', paddingTop: 36, paddingBottom: 40, paddingLeft: 50, paddingRight: 42 },
  logoImg: { width: 92, height: 26, objectFit: 'contain' },
  logoFallback: { fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: c.ink, letterSpacing: 2 },

  eyebrow: { fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: c.accentText, letterSpacing: 3, textTransform: 'uppercase', marginTop: 30, marginBottom: 14 },
  title: { fontFamily: 'Inter', fontWeight: 700, fontSize: 31, color: c.ink, letterSpacing: 6 },
  titleSub: { fontFamily: 'Spectral', fontStyle: 'italic', fontSize: 16, color: c.sub, marginTop: 5 },
  accentRule: { width: 54, height: 3, backgroundColor: c.accent, borderRadius: 2, marginTop: 20, marginBottom: 22 },

  presentedTo: { fontFamily: 'Inter', fontWeight: 700, fontSize: 7.5, color: c.faint, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 },
  name: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 41, color: c.ink, letterSpacing: -0.5, marginBottom: 7 },
  dateLine: { fontFamily: 'Inter', fontWeight: 500, fontSize: 9, color: c.sub, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 18 },
  paragraph: { fontFamily: 'Inter', fontSize: 10, color: c.body, lineHeight: 1.7, maxWidth: '92%', marginBottom: 22 },

  statsRow: { flexDirection: 'row', marginBottom: 22 },
  statBox: { marginRight: 24, paddingRight: 24, borderRightWidth: 0.75, borderRightColor: c.line },
  statBoxLast: { marginRight: 0, paddingRight: 0, borderRightWidth: 0 },
  statLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: 6.5, color: c.faint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 },
  statVal: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 15, color: c.ink },

  benchmarks: { fontFamily: 'Inter', fontWeight: 700, fontSize: 7, color: c.sub, letterSpacing: 0.6 },

  sigArea: { flexDirection: 'row', marginTop: 'auto', alignItems: 'flex-end' },
  sigBlock: { marginRight: 44 },
  sigScript: { fontFamily: 'Spectral', fontStyle: 'italic', fontSize: 22, color: c.ink },
  sigLine: { height: 0.75, backgroundColor: c.ink, marginTop: 7, marginBottom: 5, width: 150 },
  sigLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: 7, color: c.faint, letterSpacing: 1.5, textTransform: 'uppercase' },

  // RIGHT dark sidebar
  sidebar: { width: '32%', backgroundColor: c.ink, paddingTop: 36, paddingBottom: 38, paddingHorizontal: 26, alignItems: 'center' },
  sbTopRule: { width: 40, height: 3, borderRadius: 2, marginBottom: 26 },
  badgeLabel: { fontFamily: 'Inter', fontWeight: 700, fontSize: 7, color: 'rgba(255,255,255,0.5)', letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 18 },
  badgeTier: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 18, marginTop: 6, textAlign: 'center', letterSpacing: 0.2 },
  sbDivider: { height: 0.75, width: '74%', backgroundColor: 'rgba(255,255,255,0.14)', marginVertical: 24 },
  sbFootK: { fontFamily: 'Inter', fontWeight: 700, fontSize: 7, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  sbFootV: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 37, color: c.white, letterSpacing: -1 },
  sbFootU: { fontFamily: 'Inter', fontSize: 8.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, marginTop: 4 },
  sbBench: { fontFamily: 'Inter', fontSize: 7.5, color: 'rgba(255,255,255,0.42)', letterSpacing: 0.5, textAlign: 'center', marginTop: 16, lineHeight: 1.7 },
  qrWrap: { marginTop: 'auto', alignItems: 'center' },
  qrChip: { backgroundColor: c.white, borderRadius: 7, padding: 8 },
  qrCap: { fontFamily: 'Inter', fontWeight: 700, fontSize: 6.5, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 9, textAlign: 'center' },
  qrId: { fontFamily: 'Inter', fontSize: 6.5, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginTop: 3 },
});

/* ---------------- MAIN ---------------- */
export default function CertificatePDF({ submission, logoDataUri }) {
  registerReportFonts();

  const m = buildReportModel(submission);
  const name = m.name;
  const totalFmt = m.totalFmt;
  const tier = TIER_META[m.idy.title] || TIER_META['CLIMATE STEWARD'];
  const tierTitle = titleCase(m.idy.title);
  const primaryTitle = titleCase(m.primaryP.title);
  const secondaryTitle = titleCase(m.secondaryP.title);

  const dateObj = new Date(submission?.created_at || Date.now());
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  const certId = submission?.cert_id || submission?.certNumber || `NCC-${dateObj.getTime().toString().slice(-6)}`;
  const verifyUrl = "https://www.aptechlab.com.np/calculator";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* LEFT — content */}
        <View style={styles.left}>
          {logoDataUri ? <Image src={logoDataUri} style={styles.logoImg} /> : <Text style={styles.logoFallback}>APTECH LAB</Text>}
          <Text style={{ position: 'absolute', top: 38, right: 42, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: c.accentText, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            #whatsyournumberchallenge
          </Text>

          <Text style={styles.eyebrow}>Nepal Climate Check-up · Certificate of Completion</Text>
          <Text style={styles.title}>CERTIFICATE</Text>
          <Text style={styles.titleSub}>of Climate Assessment</Text>
          <View style={styles.accentRule} />

          <Text style={styles.presentedTo}>Presented to</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.dateLine}>Issued {dateStr}</Text>

          <Text style={styles.paragraph}>
            This certifies that the recipient has completed Nepal's Climate Check-up, measured their annual
            carbon footprint, and pledged to reduce it — joining a growing movement of climate-conscious citizens.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Climate Tier</Text>
              <Text style={[styles.statVal, { color: tier.color }]}>{tierTitle}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Primary Persona</Text>
              <Text style={styles.statVal}>{primaryTitle}</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxLast]}>
              <Text style={styles.statLabel}>Climate Superpower</Text>
              <Text style={styles.statVal}>{secondaryTitle}</Text>
            </View>
          </View>

          <Text style={styles.benchmarks}>
            BENCHMARKS   ·   NEPAL AVG 0.60   ·   1.5°C BUDGET 2.50   ·   GLOBAL AVG 4.70 tCO₂e
          </Text>

          <View style={styles.sigArea}>
            <View style={styles.sigBlock}>
              <Text style={styles.sigScript}>Aptech Lab</Text>
              <View style={styles.sigLine} />
              <Text style={styles.sigLabel}>Issuing Authority · Nepal</Text>
            </View>
            <View style={styles.sigBlock}>
              <Text style={styles.sigScript}>{dateStr.split(' ').slice(1).join(' ')}</Text>
              <View style={styles.sigLine} />
              <Text style={styles.sigLabel}>Date of Issue</Text>
            </View>
          </View>
        </View>

        {/* RIGHT — dark sidebar housing badge + stat + QR */}
        <View style={styles.sidebar}>
          <View style={[styles.sbTopRule, { backgroundColor: tier.color }]} />
          <TierBadge badgeKey={tier.key} col={tier.color} />
          <Text style={styles.badgeLabel}>Climate Tier</Text>
          <Text style={[styles.badgeTier, { color: tier.color }]}>{tierTitle}</Text>

          <View style={styles.sbDivider} />

          <Text style={styles.sbFootK}>Annual Footprint</Text>
          <Text style={styles.sbFootV}>{totalFmt}</Text>
          <Text style={styles.sbFootU}>tCO₂e / year</Text>
          <Text style={styles.sbBench}>Nepal 0.60 · Budget 2.50 · Global 4.70</Text>

          <View style={styles.qrWrap}>
            <View style={styles.qrChip}>
              <QrDark value={verifyUrl} size={58} />
            </View>
            <Text style={styles.qrCap}>Scan to calculate{'\n'}your number</Text>
            <Text style={styles.qrId}>{certId}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
