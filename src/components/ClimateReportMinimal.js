import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Circle } from '@react-pdf/renderer';
import { buildReportModel, fmtTierRange, PRIMARY_PERSONAS, SECONDARY_PERSONAS } from '../lib/reportModel';
import { registerReportFonts } from '../lib/reportFonts';

/* ---------------- PALETTE ---------------- */
const c = {
  page: '#FBFBF7',      // warm paper
  card: '#FFFFFF',
  ink: '#1B1A14',
  body: '#3F3C34',
  sub: '#6F6A5E',
  faint: '#A8A395',
  line: '#E4E0D4',
  hair: '#ECE8DE',
  accent: '#9BB62B',    // BRAND — theme green
  accentText: '#65800F', // darker brand shade for legible text
  accentSoft: '#EFF3D6', // light brand tint
};

// Professional, distinguishable categorical palette for the donut breakdown.
const CAT_COLORS = {
  cooking: '#C2773F',
  homeEnergy: '#8C7B5A',
  agBurning: '#A8543C',
  transport: '#3E6E8C',
  food: '#3F8E80',
  shopping: '#7E6A93',
  waste: '#6E86A0',
  digital: '#C2A24A',
};

// Official tier colours
const TIER_COLORS = {
  'CLIMATE GUARDIAN': '#A7ADA3',
  'CLIMATE STEWARD': '#9BB62B',
  'CLIMATE CHALLENGER': '#3F6E8C',
  'CLIMATE CATALYST': '#C2853A',
  'CLIMATE LEADER IN TRANSITION': '#A8472F',
};
const TIER_EMOJIS = {
  'CLIMATE GUARDIAN': '🌍',
  'CLIMATE STEWARD': '🌱',
  'CLIMATE CHALLENGER': '🌿',
  'CLIMATE CATALYST': '🔥',
  'CLIMATE LEADER IN TRANSITION': '⭐',
};
const TIER_COLOR_NAMES = {
  'CLIMATE GUARDIAN': 'Platinum',
  'CLIMATE STEWARD': 'Green',
  'CLIMATE CHALLENGER': 'Blue',
  'CLIMATE CATALYST': 'Orange',
  'CLIMATE LEADER IN TRANSITION': 'Red',
};

const PERSONA_EMOJIS = {
  'FIRE STARTER': '🔥', 'ROAD WARRIOR': '🚗', 'SKY NOMAD': '✈️', 'MEAT MACHINE': '🍖',
  'CONCRETE KING': '🏠', 'RETAIL ROCKSTAR': '🛍', 'DIGITAL DRAGON': '📱', 'PROMPT NINJA': '🤖',
  'SMOKE FARMER': '🌾', 'BUFFALO BOSS': '🦬', 'PLASTIC PIRATE': '📦', 'FIELD FLAMER': '🌾',
  'WALKING LEGEND': '🚶', 'PEDAL HERO': '🚲', 'HYDRO HERO': '⚡', 'LOCAL LEGEND': '🌿',
  'CIRCULAR CHAMPION': '♻', 'PLANT PIONEER': '🌱', 'COZY MINIMALIST': '🏡', 'THRIFT NINJA': '🛍',
  'BIOGAS BOSS': '🫧', 'PLANET PAL': '🦋',
  'KITCHEN FURNACE': '🍳', 'ENERGY BARON': '💡', 'SMOKE SIGNAL': '🔥', 'MILE MASTER': '🛣',
  'FEAST BARON': '🍽', 'CART COMMANDER': '🛒', 'WASTE WRANGLER': '🗑', 'SCREEN SOVEREIGN': '💻'
};

const PERSONA_TRIGGERS = {
  'FIRE STARTER': 'Waste burning', 'ROAD WARRIOR': 'Transport', 'SKY NOMAD': 'Flights',
  'MEAT MACHINE': 'Diet', 'CONCRETE KING': 'Housing', 'RETAIL ROCKSTAR': 'Shopping',
  'DIGITAL DRAGON': 'Devices', 'PROMPT NINJA': 'AI usage', 'SMOKE FARMER': 'Firewood',
  'BUFFALO BOSS': 'Livestock', 'PLASTIC PIRATE': 'Plastic', 'FIELD FLAMER': 'Crop burning',
  'WALKING LEGEND': 'Walks', 'PEDAL HERO': 'Bicycle', 'HYDRO HERO': 'Electric cooking',
  'LOCAL LEGEND': 'Eats local', 'CIRCULAR CHAMPION': 'Waste management', 'PLANT PIONEER': 'Vegetarian',
  'COZY MINIMALIST': 'Small house', 'THRIFT NINJA': 'Second hand', 'BIOGAS BOSS': 'Renewable cooking',
  'PLANET PAL': 'Low overall footprint',
  'KITCHEN FURNACE': 'Cooking', 'ENERGY BARON': 'Home energy', 'SMOKE SIGNAL': 'Crop burning',
  'MILE MASTER': 'Transport', 'FEAST BARON': 'Food', 'CART COMMANDER': 'Shopping',
  'WASTE WRANGLER': 'Waste', 'SCREEN SOVEREIGN': 'Digital'
};

const tierColorForValue = (v) => {
  if (v <= 1.25) return TIER_COLORS['CLIMATE GUARDIAN'];
  if (v <= 2.5) return TIER_COLORS['CLIMATE STEWARD'];
  if (v <= 4.0) return TIER_COLORS['CLIMATE CHALLENGER'];
  if (v <= 6.0) return TIER_COLORS['CLIMATE CATALYST'];
  return TIER_COLORS['CLIMATE LEADER IN TRANSITION'];
};
const titleCase = (str) => String(str).toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());

/* ---------------- STYLES ---------------- */
const s = StyleSheet.create({
  page: { backgroundColor: c.page, color: c.body, fontFamily: 'Inter', paddingTop: 44, paddingBottom: 58, paddingHorizontal: 50, fontSize: 9 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  logo: { width: 90, height: 26, objectFit: 'contain' },
  wordmark: { fontSize: 12, fontWeight: 700, color: c.ink, letterSpacing: 1.5 },
  headMeta: { fontSize: 6.5, color: c.faint, letterSpacing: 1.6, textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.7 },
  headerRule: { borderBottomWidth: 0.75, borderBottomColor: c.line, marginTop: 11, marginBottom: 26 },
  footer: { position: 'absolute', bottom: 26, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.75, borderTopColor: c.line, paddingTop: 8 },
  footText: { fontSize: 6.5, color: c.faint, letterSpacing: 1.6, textTransform: 'uppercase' },

  sectionWrap: { marginBottom: 20 },
  sectionNo: { fontSize: 8, fontWeight: 700, color: c.accentText, letterSpacing: 3, marginBottom: 7 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionBar: { width: 3, height: 19, backgroundColor: c.accent, marginRight: 11 },
  sectionTitle: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 22, color: c.ink, letterSpacing: -0.3 },
  rule: { borderBottomWidth: 0.75, borderBottomColor: c.line },

  // cover - typographic hero layout
  heroNameRow: { marginBottom: 50 },
  heroPrepared: { fontSize: 8, fontWeight: 700, color: c.faint, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  heroName: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 34, color: c.ink, letterSpacing: -0.5 },
  
  heroBlock: { marginBottom: 40 },
  heroScoreK: { fontSize: 8, fontWeight: 700, color: c.faint, letterSpacing: 2, textTransform: 'uppercase', marginBottom: -2 },
  heroScoreRow: { flexDirection: 'row', alignItems: 'flex-end' },
  heroScoreV: { fontFamily: 'Inter', fontWeight: 700, fontSize: 84, color: c.ink, letterSpacing: -3, lineHeight: 1 },
  heroScoreU: { fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: c.sub, marginBottom: 14, marginLeft: 12 },
  
  heroAccent: { width: 48, height: 4, borderRadius: 2, marginTop: 12, marginBottom: 18 },
  heroIdTitle: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 24, color: c.ink, letterSpacing: -0.2, marginBottom: 6 },
  heroIdDesc: { fontSize: 11, color: c.body, lineHeight: 1.6, maxWidth: 360, marginBottom: 12 },
  heroIdRange: { fontSize: 8, fontWeight: 700, color: c.faint, letterSpacing: 1.5, textTransform: 'uppercase' },

  // identity scale - original format
  scaleLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scaleCap: { fontSize: 7, color: c.faint, letterSpacing: 1, textTransform: 'uppercase' },
  band: { flexDirection: 'row', height: 7, borderRadius: 4, overflow: 'hidden' },
  ticks: { flexDirection: 'row', marginTop: 5 },

  // classification key - original format
  clsWrap: { marginTop: 24, borderTopWidth: 0.75, borderTopColor: c.line, paddingTop: 16 },
  clsHeader: { fontSize: 7, fontWeight: 700, color: c.faint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  clsRow: { flexDirection: 'row', marginBottom: 6 },
  clsRange: { width: 70, fontSize: 8.5, fontWeight: 700, color: c.sub },
  clsName: { flex: 1, fontFamily: 'Spectral', fontSize: 11, color: c.body },
  clsColorName: { width: 60, fontSize: 8.5, color: c.faint },

  // breakdown - new formatting kept
  breakdownPanel: { backgroundColor: c.card, borderWidth: 0.75, borderColor: c.line, borderRadius: 14, paddingVertical: 26, paddingHorizontal: 28, marginBottom: 30, flexDirection: 'row', alignItems: 'center' },
  donutWrap: { width: 176, height: 176, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutTotal: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 25, color: c.ink, letterSpacing: -0.5 },
  donutUnit: { fontSize: 6.5, color: c.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 3 },

  legRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  legSwatch: { width: 9, height: 9, borderRadius: 2.5, marginRight: 12 },
  legName: { flex: 1, fontSize: 9.5, color: c.body },
  legVal: { fontSize: 9.5, fontWeight: 500, color: c.ink, width: 60, textAlign: 'right' },
  legPct: { fontSize: 9, fontWeight: 700, color: c.sub, width: 32, textAlign: 'right' },

  // comparison - new formatting kept
  cmpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  cmpLabel: { width: 100, fontSize: 9, color: c.body },
  cmpTrack: { flex: 1, height: 8, backgroundColor: c.hair, borderRadius: 4, overflow: 'hidden', marginRight: 12 },
  cmpFill: { height: 8, borderRadius: 4 },
  cmpVal: { width: 46, fontSize: 8.5, fontWeight: 500, color: c.sub, textAlign: 'right' },

  // dna - premium editorial layout
  note: { fontSize: 9.5, color: c.sub, lineHeight: 1.65, marginBottom: 30 },
  dnaWrap: { marginTop: 10 },
  dnaBlock: { paddingVertical: 26, borderTopWidth: 1, borderTopColor: c.line },
  dnaBlockH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  dnaTagK: { fontSize: 7.5, fontWeight: 700, color: c.sub, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  dnaTagV: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 26, color: c.ink, letterSpacing: -0.5 },
  
  dnaPill: { backgroundColor: c.accentSoft, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  dnaPillText: { fontSize: 7.5, fontWeight: 700, color: c.accentText, letterSpacing: 0.5 },
  
  dnaBodyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dnaColText: { flex: 1, paddingRight: 24 },
  
  dnaHabitWrap: { borderLeftWidth: 2, borderLeftColor: c.accent, paddingLeft: 14, marginBottom: 16 },
  dnaHabitText: { fontFamily: 'Spectral', fontStyle: 'italic', fontSize: 15, color: c.ink, lineHeight: 1.45 },
  
  dnaLabel: { fontSize: 7, fontWeight: 700, color: c.faint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  dnaText: { fontSize: 9.5, color: c.body, lineHeight: 1.6, marginBottom: 16 },

  // actions - new formatting kept
  actRow: { flexDirection: 'row', backgroundColor: c.card, borderWidth: 0.75, borderColor: c.line, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 12, alignItems: 'center' },
  actRank: { width: 34, fontFamily: 'Spectral', fontWeight: 700, fontSize: 18, color: c.faint },
  actTitle: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 13, color: c.ink, marginBottom: 4 },
  actDesc: { fontSize: 8.5, color: c.sub, lineHeight: 1.5, marginBottom: 7 },
  actRed: { fontSize: 9, fontWeight: 700, color: c.accentText },
  actMeta: { width: 128, alignItems: 'flex-end' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaLabel: { fontSize: 6.5, color: c.faint, letterSpacing: 0.8, textTransform: 'uppercase', marginRight: 8 },

  // roadmap - new formatting kept
  rmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.75, borderBottomColor: c.hair },
  rmLabel: { fontSize: 9.5, color: c.body, flex: 1, paddingRight: 12 },
  rmVal: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 11, color: c.ink },

  // pledge - new formatting kept
  pledge: { fontFamily: 'Spectral', fontStyle: 'italic', fontSize: 13, color: c.ink, lineHeight: 1.75, marginBottom: 26 },
  signLine: { borderBottomWidth: 0.75, borderBottomColor: c.ink, width: 210, paddingBottom: 5 },
  signName: { fontFamily: 'Spectral', fontWeight: 700, fontSize: 18, color: c.ink },
  signSub: { fontSize: 6.5, color: c.faint, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 7 },
});

/* ---------------- DONUT ---------------- */
function wedgePath(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}
function Donut({ data, size = 176, thickness = 25, holeColor }) {
  const r = size / 2, cx = r, cy = r, inner = r - thickness;
  const sum = data.reduce((acc, d) => acc + d.val, 0) || 1;
  let a0 = -Math.PI / 2;
  const wedges = [];
  data.forEach((d, i) => {
    const frac = d.val / sum;
    if (frac <= 0) return;
    if (frac >= 0.9999) { wedges.push(<Circle key={i} cx={cx} cy={cy} r={r} fill={d.color} />); return; }
    const a1 = a0 + frac * 2 * Math.PI;
    wedges.push(<Path key={i} d={wedgePath(cx, cy, r, a0, a1)} fill={d.color} stroke={holeColor} strokeWidth={1.8} />);
    a0 = a1;
  });
  return (
    <Svg width={size} height={size}>
      {wedges}
      <Circle cx={cx} cy={cy} r={inner} fill={holeColor} />
    </Svg>
  );
}

/* ---------------- DOTS ---------------- */
const Dots = ({ n, max = 5, color }) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: max }).map((_, i) => (
      <View key={i} style={{ width: 5, height: 5, borderRadius: 2.5, marginLeft: 3.5, backgroundColor: i < n ? color : c.line }} />
    ))}
  </View>
);

/* ---------------- MAIN ---------------- */
export default function ClimateReportMinimal({ submission, logoDataUri }) {
  registerReportFonts();
  const m = buildReportModel(submission);
  const { name, totalFmt, calcTotal, idy, tiers, categories, primaryP, secondaryP, primaryMetric, secondaryMetric, actions, roadmap, multNepal, withinBudget, trees, projected, benchMax } = m;

  const idColor = TIER_COLORS[idy.title] || c.accent;
  const dateStr = new Date(submission?.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const shown = categories.filter((x) => x.val > 0);
  const donutData = shown.map((x) => ({ ...x, color: CAT_COLORS[x.key] || c.faint }));

  const SCALE_MAX = 8;
  const userPct = Math.max(0, Math.min(1, calcTotal / SCALE_MAX));
  const bandDefs = tiers.map((t) => ({ ...t, w: Math.min(t.max, SCALE_MAX) - t.min }));

  const benchmarks = [
    { label: 'Nepal average', val: 0.6 },
    { label: '1.5°C budget', val: 2.5, target: true },
    { label: 'You', val: calcTotal, you: true },
    { label: 'Global average', val: 4.7 },
    { label: 'USA', val: 14.0 },
  ];

  const Head = ({ label }) => (
    <View fixed>
      <View style={s.header}>
        {logoDataUri ? <Image src={logoDataUri} style={s.logo} /> : <Text style={s.wordmark}>APTECH LAB</Text>}
        <Text style={s.headMeta}>{label}{'\n'}{name}</Text>
      </View>
      <View style={s.headerRule} />
    </View>
  );

  const Foot = () => (
    <View style={s.footer} fixed>
      <Text style={s.footText}>Nepal Climate Check-up</Text>
      <Text style={s.footText} render={({ pageNumber, totalPages }) => `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`} />
    </View>
  );

  const Section = ({ no, title, mt }) => (
    <View style={[s.sectionWrap, mt ? { marginTop: mt } : null]}>
      <Text style={s.sectionNo}>{no}</Text>
      <View style={s.sectionTitleRow}>
        <View style={s.sectionBar} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page size="A4" style={s.page}>
        <Head label="Annual Climate Report" />

        <View style={s.heroNameRow}>
          <Text style={s.heroPrepared}>Prepared for</Text>
          <Text style={s.heroName}>{name}</Text>
        </View>

        <View style={s.heroBlock}>
          <Text style={s.heroScoreK}>Annual Footprint</Text>
          <View style={s.heroScoreRow}>
            <Text style={s.heroScoreV}>{totalFmt}</Text>
            <Text style={s.heroScoreU}>tCO₂e / year</Text>
          </View>
          
          <View style={[s.heroAccent, { backgroundColor: idColor }]} />
          
          <Text style={[s.heroIdTitle, { color: idColor }]}>{titleCase(idy.title)}</Text>
          <Text style={s.heroIdDesc}>{idy.desc}</Text>
          <Text style={s.heroIdRange}>Band range · {fmtTierRange(idy)}</Text>
        </View>

        <View style={{ marginTop: 34 }}>
          {/* identity scale */}
          <View style={s.scaleLabelRow}>
            <Text style={s.scaleCap}>Identity scale (tCO₂e / year)</Text>
            <Text style={[s.scaleCap, { color: idColor }]}>You · {totalFmt} t</Text>
          </View>
          <View style={s.band}>
            {bandDefs.map((b, i) => (
              <View key={i} style={{ flex: b.w, backgroundColor: b.title === idy.title ? idColor : c.line }} />
            ))}
          </View>
          {/* marker */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: `${userPct * 100}%` }} />
            <View style={{ alignItems: 'center', marginLeft: -8 }}>
              <View style={{ width: 1.5, height: 9, backgroundColor: c.ink, marginTop: 2 }} />
            </View>
          </View>
          <View style={s.ticks}>
            {[1.25, 2.5, 4, 6].map((t, i) => (
              <Text key={i} style={{ position: 'absolute', left: `${(t / SCALE_MAX) * 100}%`, fontSize: 6.5, color: c.faint, marginLeft: -8 }}>{t.toFixed(2)}</Text>
            ))}
          </View>

          {/* classification key */}
          <View style={s.clsWrap}>
            <Text style={s.clsHeader}>Metric Classification</Text>
            {tiers.map((t, i) => (
              <View key={i} style={s.clsRow}>
                <Text style={s.clsRange}>{fmtTierRange(t)}</Text>
                <Text style={[s.clsName, { color: t.title === idy.title ? TIER_COLORS[t.title] : c.body }]}>{TIER_EMOJIS[t.title]}  {titleCase(t.title)}</Text>
                <Text style={s.clsColorName}>{TIER_COLOR_NAMES[t.title]}</Text>
              </View>
            ))}
          </View>
        </View>

        <Foot />
      </Page>

      {/* PAGE 2 — BREAKDOWN */}
      <Page size="A4" style={s.page}>
        <Head label="Footprint Breakdown" />
        <Section no="01" title="Footprint Breakdown" />

        <View style={s.breakdownPanel}>
          <View style={s.donutWrap}>
            <Donut data={donutData} size={176} thickness={25} holeColor={c.card} />
            <View style={s.donutCenter}>
              <Text style={s.donutTotal}>{totalFmt}</Text>
              <Text style={s.donutUnit}>tCO₂e / yr</Text>
            </View>
          </View>
          <View style={{ flex: 1, paddingLeft: 40 }}>
            {donutData.map((cat, i) => {
              const kg = Math.round(cat.val * 1000);
              const pct = Math.round((cat.val / calcTotal) * 100);
              return (
                <View key={i} style={s.legRow}>
                  <View style={[s.legSwatch, { backgroundColor: cat.color }]} />
                  <Text style={s.legName}>{cat.name}</Text>
                  <Text style={s.legVal}>{kg} kg</Text>
                  <Text style={s.legPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Section no="02" title="How You Compare" />
        {benchmarks.map((b, i) => {
          const pct = Math.min(100, (b.val / benchMax) * 100);
          // 'You' uses theme green. '1.5C Target' uses a dark distinct ink color to stand out as a hard baseline.
          const barCol = b.you ? idColor : (b.target ? c.ink : tierColorForValue(b.val));
          return (
            <View key={i} style={s.cmpRow}>
              <Text style={[s.cmpLabel, b.you ? { color: idColor, fontWeight: 700 } : (b.target ? { fontWeight: 500 } : null)]}>{b.label}</Text>
              <View style={s.cmpTrack}><View style={[s.cmpFill, { width: `${pct}%`, backgroundColor: barCol }]} /></View>
              <Text style={[s.cmpVal, b.you ? { color: idColor, fontWeight: 700 } : null]}>{b.val.toFixed(2)} t</Text>
            </View>
          );
        })}

        <Foot />
      </Page>

      {/* PAGE 3 — CLIMATE DNA */}
      <Page size="A4" style={s.page}>
        <Head label="Climate DNA" />
        <Section no="03" title="Your Climate DNA" />
        <Text style={s.note}>
          Personas are matched from the lifestyle signals in your answers. The primary persona is the highest-impact
          habit raising your footprint; the secondary is your strongest low-carbon habit. The tag under each shows the
          exact share of your footprint that behaviour drives.
        </Text>

        <View style={s.dnaWrap}>
          {/* PRIMARY */}
          <View style={s.dnaBlock}>
            <View style={s.dnaBlockH}>
              <View>
                <Text style={s.dnaTagK}>Primary Persona</Text>
                <Text style={s.dnaTagV}>{primaryP.title}</Text>
              </View>
              <View style={s.dnaPill}>
                <Text style={s.dnaPillText}>{primaryMetric.label.toUpperCase()} · {primaryMetric.kg} KG · {primaryMetric.pct}%</Text>
              </View>
            </View>
            
            <View style={s.dnaBodyRow}>
              <View style={s.dnaColText}>
                <Text style={s.dnaLabel}>Climate Habit</Text>
                <View style={s.dnaHabitWrap}>
                   <Text style={s.dnaHabitText}>"{primaryP.habit}"</Text>
                </View>
              </View>
              <View style={s.dnaColText}>
                <Text style={s.dnaLabel}>Mission</Text>
                <Text style={s.dnaText}>{primaryP.mission}</Text>
                <Text style={s.dnaLabel}>Fun Fact</Text>
                <Text style={[s.dnaText, { marginBottom: 0 }]}>{primaryP.fact}</Text>
              </View>
            </View>
          </View>

          {/* SECONDARY */}
          <View style={s.dnaBlock}>
            <View style={s.dnaBlockH}>
              <View>
                <Text style={s.dnaTagK}>Secondary Persona</Text>
                <Text style={s.dnaTagV}>{secondaryP.title}</Text>
              </View>
              <View style={[s.dnaPill, { backgroundColor: c.hair }]}>
                <Text style={[s.dnaPillText, { color: c.sub }]}>{secondaryMetric.label.toUpperCase()} · {secondaryMetric.kg} KG · {secondaryMetric.pct}%</Text>
              </View>
            </View>
            
            <View style={s.dnaBodyRow}>
              <View style={s.dnaColText}>
                <Text style={s.dnaLabel}>Superpower</Text>
                <View style={[s.dnaHabitWrap, { borderLeftColor: c.sub }]}>
                   <Text style={s.dnaHabitText}>"{secondaryP.superpower}"</Text>
                </View>
              </View>
              <View style={s.dnaColText}>
                 <Text style={s.dnaLabel}>Matched Because</Text>
                 <Text style={[s.dnaText, { marginBottom: 0 }]}>{secondaryP.basis.charAt(0).toUpperCase() + secondaryP.basis.slice(1)}.</Text>
              </View>
            </View>
          </View>
        </View>

        <Foot />
      </Page>

      {/* PAGE 4 — PERSONA CLASSIFICATION */}
      <Page size="A4" style={s.page}>
        <Head label="Climate DNA" />
        <Section no="04" title="How We Assign Personas" />
        
        <View style={[s.clsWrap, { marginTop: 30 }]}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={[s.clsHeader, { color: c.ink, marginBottom: 12 }]}>Primary Persona (Footprint Drivers)</Text>
              {PRIMARY_PERSONAS.map((p, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 0.75, borderBottomColor: c.hair }}>
                   <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                     <Text style={{ fontFamily: 'Spectral', fontSize: 11, color: p.title === primaryP.title ? c.accent : c.body, fontWeight: p.title === primaryP.title ? 700 : 400 }}>{titleCase(p.title)}</Text>
                   </View>
                   <Text style={{ fontSize: 8, color: c.faint, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>{PERSONA_TRIGGERS[p.title] || p.metricCat}</Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1, paddingLeft: 16 }}>
              <Text style={[s.clsHeader, { color: c.ink, marginBottom: 12 }]}>Secondary Persona (Positive Habits)</Text>
              {SECONDARY_PERSONAS.map((p, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 0.75, borderBottomColor: c.hair }}>
                   <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                     <Text style={{ fontFamily: 'Spectral', fontSize: 11, color: p.title === secondaryP.title ? c.accent : c.body, fontWeight: p.title === secondaryP.title ? 700 : 400 }}>{titleCase(p.title)}</Text>
                   </View>
                   <Text style={{ fontSize: 8, color: c.faint, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>{PERSONA_TRIGGERS[p.title] || p.metricCat}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Foot />
      </Page>

      {/* PAGE 5 — ACTIONS + ROADMAP + PLEDGE */}
      <Page size="A4" style={s.page}>
        <Head label="Action Plan" />
        <Section no="05" title="Priority Actions" />
        {actions.map((a, i) => (
          <View key={i} style={s.actRow} wrap={false}>
            <Text style={s.actRank}>{a.rank}</Text>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={s.actTitle}>{a.title}</Text>
              <Text style={s.actDesc}>{a.desc}</Text>
              <Text style={s.actRed}>{a.red}</Text>
            </View>
            <View style={s.actMeta}>
              <View style={s.metaRow}><Text style={s.metaLabel}>Effort</Text><Dots n={a.diff} color={c.faint} /></View>
              <View style={s.metaRow}><Text style={s.metaLabel}>Impact</Text><Dots n={a.imp} color={c.accent} /></View>
            </View>
          </View>
        ))}

        <Section no="06" title="Your Roadmap" mt={30} />
        {roadmap.map((r, i) => (
          <View key={i} style={s.rmRow}>
            <Text style={[s.rmLabel, r.netZero ? { color: c.accentText, fontWeight: 500 } : (i === 0 ? { fontWeight: 500, color: c.ink } : null)]}>{r.label}</Text>
            <Text style={[s.rmVal, r.netZero ? { color: c.accentText } : null]}>{r.netZero ? '0.00 t · NET ZERO' : `${r.val.toFixed(2)} t`}</Text>
          </View>
        ))}
        <Text style={[s.note, { marginTop: 13, marginBottom: 28 }]}>
          You emit about {multNepal}× the average Nepali and are {withinBudget ? 'within' : 'above'} the 1.5°C budget of
          2.50 t. Offsetting today would take roughly {trees} trees growing for a year; your top three actions bring you
          to about {projected} t.
        </Text>

        <View style={s.rule} />
        <Section no="06" title="The Climate Pledge" mt={26} />
        <Text style={s.pledge}>
          "I understand that every journey, meal, purchase and conversation has an impact on our planet. I pledge to
          measure my footprint, reduce it where I can, inspire others through my actions, and become part of the
          solution. Climate action is not perfection — it is progress."
        </Text>
        <View style={s.signLine}><Text style={s.signName}>{name}</Text></View>
        <Text style={s.signSub}>Digital signature · {dateStr}</Text>

        <Foot />
      </Page>
    </Document>
  );
}
