import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { buildReportModel, fmtTierRange } from '../lib/reportModel';
import { registerReportFonts } from '../lib/reportFonts';
import { TierBadge } from './TierBadges';

/* ---------------- PALETTE ---------------- */
const colors = {
  bg: '#FAF7F0',
  card: '#FFFFFF',
  panel: '#F2EFDE',
  ink: '#3E2723',
  inkDeep: '#1A110B',
  inkSoft: '#705C48',
  line: '#E8E0D5',
  dot: '#CFC6B8',
  teal: '#2A7A7A',
  coral: '#D85A30',
  sky: '#6E9AA6',
  saffron: '#C89A3D',
  orange: '#D8B77C',
  blue: '#4A90E2',
  waste: '#8B7A68',
  // identity tiers
  platinum: '#8A9A5B',
  green: '#7A9D34',
  tierBlue: '#4A90E2',
  tierOrange: '#D89A3D',
  red: '#C0492B',
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 50, paddingHorizontal: 42, backgroundColor: colors.bg, fontFamily: 'Inter', color: colors.ink },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  logo: { width: 116, height: 36, objectFit: 'contain' },
  headerRight: { fontSize: 7.5, color: colors.inkSoft, textAlign: 'right', letterSpacing: 1.6, textTransform: 'uppercase', lineHeight: 1.5 },
  hr: { borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 18 },

  sectionTitle: { fontSize: 9, fontFamily: 'Inter', fontWeight: 700, color: colors.teal, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, marginTop: 26, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 7 },

  // hero
  heroCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingVertical: 34, paddingHorizontal: 30, alignItems: 'center', marginBottom: 16 },
  heroIdentity: { fontSize: 22, fontFamily: 'Spectral', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center' },
  heroDesc: { fontSize: 11, color: colors.inkSoft, textAlign: 'center', marginBottom: 26, paddingHorizontal: 24, lineHeight: 1.5, fontFamily: 'Spectral', fontStyle: 'italic' },
  heroTotalVal: { fontSize: 50, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep },
  heroTotalLabel: { fontSize: 12, color: colors.inkSoft, fontFamily: 'Inter' },

  statRow: { flexDirection: 'row', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, overflow: 'hidden' },
  statTile: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: colors.line },
  statLabel: { fontSize: 7.5, color: colors.inkSoft, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  statVal: { fontSize: 19, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep },
  statUnit: { fontSize: 7.5, color: colors.inkSoft, marginTop: 3, letterSpacing: 0.5 },

  scaleWrap: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, overflow: 'hidden', marginTop: 8 },
  scaleHead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.line },
  scaleHeadName: { flex: 1, fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.inkSoft, letterSpacing: 1, textTransform: 'uppercase' },
  scaleHeadRange: { width: 84, textAlign: 'right', fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.inkSoft, letterSpacing: 1, textTransform: 'uppercase' },
  scaleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  scaleRowHere: { backgroundColor: 'transparent' },
  scaleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  scaleName: { flex: 1, fontSize: 10, fontFamily: 'Inter', color: colors.ink },
  scaleRange: { width: 84, textAlign: 'right', flexShrink: 0, fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: colors.inkSoft },
  scaleHere: { flexShrink: 0, fontSize: 6.5, fontFamily: 'Inter', fontWeight: 700, color: colors.card, letterSpacing: 1, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4, marginLeft: 8, marginRight: 10 },

  // info card
  infoCard: { backgroundColor: colors.panel, paddingVertical: 22, paddingHorizontal: 24, borderRadius: 10, marginBottom: 20 },
  infoTitle: { fontSize: 16, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep, marginBottom: 10 },
  infoText: { fontSize: 10, color: colors.ink, lineHeight: 1.65 },

  // bars
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 120, fontSize: 10, fontFamily: 'Inter', fontWeight: 500, color: colors.inkDeep },
  barTrack: { flex: 1, height: 9, backgroundColor: colors.line, borderRadius: 5, marginRight: 12, overflow: 'hidden' },
  barFill: { height: 9, borderRadius: 5 },
  barPct: { width: 74, fontSize: 9.5, color: colors.inkSoft, textAlign: 'right' },

  // DNA
  dnaGrid: { flexDirection: 'row' },
  dnaCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 18 },
  dnaTag: { fontSize: 7.5, fontFamily: 'Inter', fontWeight: 700, color: colors.teal, letterSpacing: 1.5, marginBottom: 10 },
  dnaTitle: { fontSize: 17, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep, marginBottom: 11 },
  dnaLabel: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.inkSoft, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 },
  dnaText: { fontSize: 10, fontFamily: 'Spectral', color: colors.ink, marginBottom: 10, lineHeight: 1.5 },
  dnaHabit: { fontSize: 12, fontFamily: 'Spectral', fontStyle: 'italic', color: colors.inkDeep, marginBottom: 10, lineHeight: 1.45 },
  dnaMethod: { fontSize: 9, fontFamily: 'Spectral', color: colors.inkSoft, lineHeight: 1.55, marginBottom: 10 },
  dnaExplain: { fontSize: 9.5, fontFamily: 'Spectral', fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45, marginBottom: 9 },
  metricPill: { alignSelf: 'flex-start', backgroundColor: colors.panel, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 9, marginBottom: 10 },
  metricPillText: { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: colors.teal, letterSpacing: 0.2 },

  // actions
  actionRow: { flexDirection: 'row', marginBottom: 11, backgroundColor: colors.card, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  rankBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rankText: { fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: colors.teal },
  actionTitle: { fontSize: 13, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep, marginBottom: 3 },
  actionDesc: { fontSize: 8.5, color: colors.inkSoft, lineHeight: 1.45, marginBottom: 6 },
  actionRed: { fontSize: 9, fontFamily: 'Inter', fontWeight: 700, color: colors.coral, letterSpacing: 0.3 },
  ratingCol: { width: 120, marginLeft: 36, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: colors.line },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingLabel: { fontSize: 6.5, color: colors.inkSoft, width: 50, textTransform: 'uppercase', letterSpacing: 0.5 },

  // roadmap
  roadStep: { flexDirection: 'row', alignItems: 'flex-start' },
  roadRail: { width: 24, alignItems: 'center' },
  roadDot: { width: 11, height: 11, borderRadius: 6, marginTop: 2 },
  roadLine: { width: 2, flexGrow: 1, minHeight: 14, backgroundColor: colors.line, marginVertical: 3 },
  roadBody: { flex: 1, paddingLeft: 14, paddingBottom: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roadLabel: { fontSize: 11, color: colors.ink, flex: 1, paddingRight: 10 },
  roadVal: { fontSize: 12, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep },
  roadNote: { fontSize: 9, color: colors.inkSoft, lineHeight: 1.6, marginTop: 4 },

  // pledge
  pledgeBox: { backgroundColor: 'rgba(42, 122, 122, 0.05)', borderLeftWidth: 4, borderLeftColor: colors.teal, padding: 20, borderRadius: 6 },
  pledgeText: { fontSize: 11.5, fontFamily: 'Spectral', fontStyle: 'italic', color: colors.inkDeep, lineHeight: 1.55, marginBottom: 14 },
  signatureLine: { marginTop: 18, borderBottomWidth: 1, borderBottomColor: colors.inkSoft, width: 210, paddingBottom: 4 },
  signName: { fontSize: 20, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep },
  signSub: { fontSize: 7.5, color: colors.inkSoft, marginTop: 7, letterSpacing: 1.2, textTransform: 'uppercase' },

  // ---- page 1 premium hero + position gauge ----
  heroPanel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderTopWidth: 6, borderRadius: 12, paddingTop: 12, paddingBottom: 12, paddingHorizontal: 34, alignItems: 'center', marginBottom: 12 },
  bandPill: { backgroundColor: colors.panel, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 15, marginTop: 10 },
  bandPillText: { fontSize: 8, fontFamily: 'Inter', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  subHead: { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: colors.inkSoft, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 5, marginTop: 0 },
  gaugeLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 9 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  legendLine: { width: 11, height: 2.5, borderRadius: 1.5, marginRight: 4, backgroundColor: colors.inkDeep },
  legendText: { fontSize: 7, fontFamily: 'Inter', color: colors.inkSoft, letterSpacing: 0.3 },

  gaugeCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingTop: 14, paddingBottom: 6, paddingHorizontal: 20, marginBottom: 10 },
  gaugeTrackWrap: { position: 'relative', justifyContent: 'center' },
  gaugeTrack: { height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', backgroundColor: colors.line },
  gaugeYouLine: { position: 'absolute', top: -5, height: 22, width: 2.5, marginLeft: -1.25, borderRadius: 2, backgroundColor: colors.inkDeep },
  gaugeTickLayer: { height: 22, position: 'relative', marginTop: 4 },
  gaugeTick: { position: 'absolute', top: 0 },
  tickVal: { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: colors.inkDeep },
  tickLabel: { fontSize: 7, fontFamily: 'Inter', color: colors.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },
});

/* ---------------- TEMPLATE-LOCAL COLOUR MAPS ---------------- */
// Data + derivation live in ../lib/reportModel (shared with the minimalist
// template). This editorial template just maps those keys to its own palette.
const CAT_COLORS = {
  cooking: colors.orange, homeEnergy: colors.coral, agBurning: colors.green, transport: colors.sky,
  food: colors.saffron, shopping: colors.teal, waste: colors.waste, digital: colors.blue,
};
const TIER_COLORS = {
  'CLIMATE GUARDIAN': colors.platinum, 'CLIMATE STEWARD': colors.green, 'CLIMATE CHALLENGER': colors.tierBlue,
  'CLIMATE CATALYST': colors.tierOrange, 'CLIMATE LEADER IN TRANSITION': colors.red,
};

/* ---------------- SMALL COMPONENTS ---------------- */
const Dots = ({ n, max = 5, color }) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: max }).map((_, i) => (
      <View
        key={i}
        style={{
          width: 6, height: 6, borderRadius: 3, marginRight: 3.5,
          backgroundColor: i < n ? color : 'transparent',
          borderWidth: i < n ? 0 : 0.8, borderColor: colors.dot,
        }}
      />
    ))}
  </View>
);

/* ---------------- MAIN ---------------- */
export default function ClimateReportPDF({ submission, logoDataUri }) {
  registerReportFonts();
  // All data + derivation come from the shared model (single source of truth).
  const m = buildReportModel(submission);
  const {
    name, totalFmt, calcTotal, primaryP, secondaryP, primaryMetric, secondaryMetric,
    actions, roadmap, multNepal, withinBudget, trees, projected, benchMax,
  } = m;

  // Map shared keys/labels to this template's palette.
  const idy = { ...m.idy, color: TIER_COLORS[m.idy.title] };
  const tiers = m.tiers.map((t) => ({ ...t, color: TIER_COLORS[t.title] }));
  const cats = m.categories.map((c) => ({ ...c, color: CAT_COLORS[c.key] }));

  // Position gauge (page 1): place the user on a 0→benchMax scale, with green/amber/red zones
  // split at the 1.5°C budget (2.5 t) and the global average (4.7 t).
  const pctOf = (v) => Math.max(0, Math.min(100, (v / benchMax) * 100));
  const youPct = pctOf(calcTotal);
  const budgetPct = pctOf(2.5);
  const globalPct = pctOf(4.7);
  const gaugeZones = [
    { w: budgetPct, color: colors.green },
    { w: globalPct - budgetPct, color: colors.saffron },
    { w: 100 - globalPct, color: colors.red },
  ];
  const gaugeTicks = [
    { label: 'Nepal', val: 0.6 },
    { label: '1.5° budget', val: 2.5 },
    { label: 'Global', val: 4.7 },
    { label: 'USA', val: 14 },
  ];
  // Anchor an absolutely-positioned label over a point without relying on transforms:
  // clamp to the edges, otherwise centre via a negative margin.
  const anchor = (pct, w) =>
    pct <= 7 ? { left: 0, width: w, alignItems: 'flex-start' }
    : pct >= 93 ? { right: 0, width: w, alignItems: 'flex-end' }
    : { left: `${pct}%`, marginLeft: -w / 2, width: w, alignItems: 'center' };

  const dateObj = new Date(submission?.created_at || Date.now());
  const reportId = submission?.cert_id || submission?.certNumber || `NCC-${dateObj.getTime().toString().slice(-6)}`;

  const Header = () => (
    <View style={{ marginBottom: 14 }} fixed>
      <View style={styles.header}>
        {logoDataUri ? <Image src={logoDataUri} style={styles.logo} /> : <View style={styles.logo} />}
        <Text style={styles.headerRight}>Official Climate Report{'\n'}{name.toUpperCase()}{'\n'}ID: {reportId}</Text>
      </View>
      <View style={styles.hr} />
    </View>
  );

  return (
    <Document>
      {/* PAGE 1 — IDENTITY + WHY 2.5 */}
      <Page size="A4" style={styles.page}>
        <Header />

        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>01 / Your Climate Identity</Text>
        <View style={[styles.heroPanel, { borderColor: idy.color }]}>
          <View style={{ marginBottom: 6 }}>
            <TierBadge title={idy.title} col={idy.color} width={64} height={74} />
          </View>
          <Text style={[styles.heroIdentity, { color: colors.inkDeep, marginBottom: 6 }]}>{idy.title}</Text>
          <Text style={[styles.heroDesc, { marginBottom: 8 }]}>{idy.desc}</Text>
          <Text style={[styles.heroTotalVal, { fontSize: 42 }]}>{totalFmt} <Text style={styles.heroTotalLabel}>tCO₂e / year</Text></Text>
        </View>

        <Text style={styles.subHead}>Where you stand</Text>
        <View style={styles.gaugeCard}>
          <View style={styles.gaugeTrackWrap}>
            <View style={styles.gaugeTrack}>
              {gaugeZones.map((z, i) => (
                <View key={i} style={{ width: `${z.w}%`, height: '100%', backgroundColor: z.color }} />
              ))}
            </View>
            <View style={[styles.gaugeYouLine, { left: `${youPct}%` }]} />
          </View>
          <View style={styles.gaugeTickLayer}>
            {gaugeTicks.map((t, i) => (
              <View key={i} style={[styles.gaugeTick, anchor(pctOf(t.val), 64)]}>
                <Text style={styles.tickVal}>{t.val.toFixed(t.val < 1 ? 2 : 1)} t</Text>
                <Text style={styles.tickLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.gaugeLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.green }]} /><Text style={styles.legendText}>Within budget</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.saffron }]} /><Text style={styles.legendText}>Above budget</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.red }]} /><Text style={styles.legendText}>High</Text></View>
            <View style={styles.legendItem}><View style={styles.legendLine} /><Text style={styles.legendText}>You</Text></View>
          </View>
        </View>

        <Text style={[styles.subHead, { marginTop: 28 }]}>Classification scale</Text>
        <View style={styles.scaleWrap}>
          <View style={styles.scaleHead}>
            <Text style={styles.scaleHeadName}>Tier / Classification</Text>
            <Text style={styles.scaleHeadRange}>Annual Range</Text>
          </View>
          {tiers.map((tier, i) => {
            const isHere = tier.title === idy.title;
            return (
              <View key={i} style={[styles.scaleRow, isHere ? styles.scaleRowHere : null, i < tiers.length - 1 ? styles.scaleRowBorder : null]}>
                <Text style={[styles.scaleName, isHere ? { fontWeight: 700, color: colors.inkDeep } : null]}>{tier.title}</Text>
                {isHere ? <Text style={[styles.scaleHere, { backgroundColor: idy.color }]}>YOU ARE HERE</Text> : null}
                <Text style={[styles.scaleRange, isHere ? { color: colors.inkDeep } : null]}>{fmtTierRange(tier)}</Text>
              </View>
            );
          })}
        </View>

      </Page>

      {/* PAGE 2 — DNA + BREAKDOWN */}
      <Page size="A4" style={styles.page}>
        <Header />

        <Text style={[styles.subHead, { marginTop: 8, textAlign: 'center' }]}>Your Footprint in Context</Text>
        <View style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 24 }}>
          <Text style={[styles.infoText, { fontSize: 10.5, lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic', color: colors.inkSoft, fontFamily: 'Spectral' }]}>
            You emit about <Text style={{ fontFamily: 'Inter', fontWeight: 700, color: colors.inkDeep, fontStyle: 'normal' }}>{multNepal}× the average Nepali</Text> and you are {withinBudget ? 'within' : 'above'} the global 1.5°C budget of 2.5 t — the remaining carbon budget shared equally among everyone on Earth. Offsetting your footprint would take roughly {trees} trees growing for a year, and keeping your top three pledges would bring you to about {projected} t.
          </Text>
        </View>

        <View wrap={false}>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>02 / Your Climate DNA</Text>
          <Text style={styles.dnaMethod}>
            Your personas are matched from the lifestyle signals in your answers. The primary persona is the
            highest-impact habit raising your footprint; the secondary is your strongest low-carbon habit.
          </Text>
          <View style={styles.dnaGrid}>
            <View style={[styles.dnaCard, { marginRight: 16 }]}>
              <Text style={styles.dnaTag}>PRIMARY PERSONA</Text>
              <Text style={styles.dnaTitle}>{primaryP.title}</Text>
              <Text style={styles.dnaLabel}>Why You Got This</Text>
              <Text style={styles.dnaExplain}>Matched because {primaryP.basis}.</Text>
              <Text style={styles.dnaLabel}>Climate Habit</Text>
              <Text style={styles.dnaHabit}>{primaryP.habit}</Text>
              <Text style={styles.dnaLabel}>Mission</Text>
              <Text style={styles.dnaText}>{primaryP.mission}</Text>
              <Text style={styles.dnaLabel}>Fun Fact</Text>
              <Text style={[styles.dnaText, { marginBottom: 0, color: colors.inkSoft }]}>{primaryP.fact}</Text>
            </View>
            <View style={styles.dnaCard}>
              <Text style={[styles.dnaTag, { color: colors.inkSoft }]}>SECONDARY PERSONA</Text>
              <Text style={styles.dnaTitle}>{secondaryP.title}</Text>
              <Text style={styles.dnaLabel}>Why You Got This</Text>
              <Text style={styles.dnaExplain}>Matched because {secondaryP.basis}.</Text>
              <Text style={styles.dnaLabel}>Climate Superpower</Text>
              <Text style={[styles.dnaText, { marginBottom: 0 }]}>{secondaryP.superpower}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 2 }}>
          <Text style={[styles.sectionTitle, { marginTop: 14, marginBottom: 12 }]}>03 / Your Carbon Breakdown</Text>
          {cats.map((c, i) => {
            const pct = Math.round((c.val / calcTotal) * 100);
            const rawKg = Math.round(c.val * 1000);
            if (pct <= 0) return null;
            return (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{c.name}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: c.color }]} />
                </View>
                <Text style={styles.barPct}>{rawKg} kg · {pct}%</Text>
              </View>
            );
          })}
        </View>
      </Page>

      {/* PAGE 3 — ACTIONS */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>04 / Your Top 5 Climate Actions</Text>
        {actions.map((a, i) => (
          <View key={i} style={styles.actionRow} wrap={false}>
            <View style={styles.rankBadge}><Text style={styles.rankText}>{a.rank}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>{a.title}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
              <Text style={styles.actionRed}>{a.red}</Text>
            </View>
            <View style={styles.ratingCol}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Difficulty</Text>
                <Dots n={a.diff} color={colors.saffron} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Impact</Text>
                <Dots n={a.imp} color={colors.teal} />
              </View>
            </View>
          </View>
        ))}
      </Page>

      {/* PAGE 4 — ROADMAP + PLEDGE */}
      <Page size="A4" style={styles.page}>
        <Header />

        <View wrap={false}>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>05 / Your Climate Roadmap</Text>
          <View style={{ marginBottom: 6 }}>
            {roadmap.map((s, i) => (
              <View key={i} style={styles.roadStep}>
                <View style={styles.roadRail}>
                  <View style={[styles.roadDot, { backgroundColor: s.netZero ? colors.teal : (i === 0 ? colors.coral : colors.inkSoft) }]} />
                  {i < roadmap.length - 1 && <View style={styles.roadLine} />}
                </View>
                <View style={styles.roadBody}>
                  <Text style={styles.roadLabel}>{s.label}</Text>
                  <Text style={[styles.roadVal, s.netZero ? { color: colors.teal } : null]}>
                    {s.netZero ? '0.00 t · NET ZERO' : `${s.val.toFixed(2)} t`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 24, padding: 16, backgroundColor: colors.bg, borderRadius: 8, borderWidth: 1, borderColor: colors.line, borderLeftWidth: 4, borderLeftColor: colors.teal }}>
            <Text style={{ fontSize: 12, fontFamily: 'Spectral', fontWeight: 700, color: colors.inkDeep, marginBottom: 4 }}>The final step to Net Zero</Text>
            <Text style={{ fontSize: 9.5, fontFamily: 'Inter', color: colors.inkSoft, lineHeight: 1.5 }}>
              Reduction is always the priority, but you can neutralize your remaining footprint today by supporting our verified biochar carbon removal projects in Nepal.
            </Text>
          </View>
        </View>

        <View wrap={false}>
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>06 / Your Climate Pledge</Text>
          <View style={styles.pledgeBox}>
            <Text style={styles.pledgeText}>
              "I understand that every journey, meal, purchase and conversation has an impact on our planet.{'\n'}
              I pledge to measure my footprint, reduce it where I can, inspire others through my actions, and become part of the solution.{'\n'}
              Climate action is not perfection. It is progress."
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 14, height: 14, borderWidth: 1, borderColor: colors.teal, marginRight: 10, backgroundColor: colors.teal }} />
              <Text style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: colors.inkDeep }}>I take this pledge.</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text style={styles.signName}>{name}</Text>
            </View>
            <Text style={styles.signSub}>Digital Signature</Text>
          </View>
        </View>
      </Page>


    </Document>
  );
}