const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\CFC\\src\\components\\ClimateReportPDF.js';

const code = `import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// --- COLORS ---
const colors = {
  bg: '#FFFFFF',
  cardBg: '#FAFAFA',
  olive: '#7A9D34',
  darkText: '#3E2723',
  gray: '#705C48',
  lightGray: '#A99A86',
  border: '#E8E0D5',
  barBg: '#F5F1E7',
  platinum: '#8A9A5B',
  green: '#7A9D34',
  blue: '#4A90E2',
  orange: '#F5A623',
  red: '#D0021B'
};

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: colors.bg, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  logo: { width: 100, height: 35, objectFit: 'contain' },
  headerRight: { fontSize: 8, color: colors.gray, textAlign: 'right', letterSpacing: 1.5, textTransform: 'uppercase' },
  hr: { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 20 },
  
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.olive, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 },
  
  // Section 1 Hero
  heroCard: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center', marginBottom: 20 },
  heroIdentity: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  heroDesc: { fontSize: 10, color: colors.gray, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20, lineHeight: 1.4 },
  
  metricsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  metricBox: { alignItems: 'center', flex: 1 },
  metricVal: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.darkText, marginBottom: 4 },
  metricLabel: { fontSize: 8, color: colors.gray, textTransform: 'uppercase' },
  
  // DNA
  dnaGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dnaCard: { flex: 1, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, padding: 16 },
  dnaTag: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.olive, letterSpacing: 1.5, marginBottom: 8 },
  dnaEmoji: { fontSize: 24, marginBottom: 8 },
  dnaTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.darkText, marginBottom: 12 },
  dnaLabel: { fontSize: 7, color: colors.gray, textTransform: 'uppercase', marginBottom: 2 },
  dnaText: { fontSize: 9, color: colors.darkText, marginBottom: 10, lineHeight: 1.3 },
  
  // Bars
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 80, fontSize: 9, color: colors.darkText },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.barBg, marginRight: 10 },
  barFill: { height: 6, backgroundColor: colors.olive },
  barPct: { width: 30, fontSize: 9, color: colors.gray, textAlign: 'right' },
  
  // Table
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginBottom: 8 },
  tableTh: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.lightGray, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  tableCellTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.darkText, marginBottom: 2 },
  tableCellDesc: { fontSize: 8, color: colors.gray, lineHeight: 1.3 },
  
  // Roadmap
  timelineItem: { flexDirection: 'row', marginBottom: 12 },
  timelineLine: { width: 2, backgroundColor: colors.border, marginLeft: 9, marginRight: 15 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.olive, position: 'absolute', left: 6, top: 4 },
  timelineContent: { flex: 1 },
  
  // Pledge
  pledgeBox: { borderLeftWidth: 4, borderLeftColor: colors.olive, paddingLeft: 16, marginTop: 20 },
  pledgeText: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.darkText, lineHeight: 1.5, marginBottom: 12 },
  pledgeSub: { fontSize: 10, color: colors.gray, fontStyle: 'italic' }
});

const PRIMARY_PERSONAS = [
  { id: '🔥', title: 'FIRE STARTER', text: 'Waste burning', habit: 'If it burns, it disappears.', mission: 'Turn smoke into soil by composting, recycling or making biochar.', fact: 'Your plants would rather eat compost than breathe smoke.', trigger: ans => ans.E2 === 'regularly' || ans.E2 === 'occasionally' },
  { id: '🚗', title: 'ROAD WARRIOR', text: 'Transport', habit: 'Always on the move.', mission: 'Incorporate public transit or walking into your weekly routine.', fact: 'Carpooling cuts your transport emissions in half immediately.', trigger: ans => ans.B2 === 'cartaxi' },
  { id: '✈️', title: 'SKY NOMAD', text: 'Flights', habit: 'Frequent air travel.', mission: 'Combine trips, fly less often, and support verified carbon removal.', fact: 'A single long-haul flight can double an average footprint.', trigger: ans => ['1long','2pluslong','1medium'].includes(ans.B4) },
  { id: '🍖', title: 'MEAT MACHINE', text: 'Diet', habit: 'High meat consumption.', mission: 'Try switching to plant-based meals a few days a week.', fact: 'Plant-based diets require 75% less land than meat-heavy diets.', trigger: ans => ['frequentred','somered'].includes(ans.C1) },
  { id: '🏠', title: 'CONCRETE KING', text: 'Housing', habit: 'Living large.', mission: 'Improve your home energy efficiency and insulation.', fact: 'Concrete production accounts for 8% of global CO2 emissions.', trigger: ans => ans.A1 === 'concrete' },
  { id: '🛍', title: 'RETAIL ROCKSTAR', text: 'Shopping', habit: 'Frequent purchases.', mission: 'Embrace mindful consumption, buy durable or second-hand goods.', fact: 'Extending a product\\'s life by just 9 months reduces its footprint by 20%.', trigger: ans => ans.D1 === '30plus' },
  { id: '📱', title: 'DIGITAL DRAGON', text: 'Devices', habit: 'Surrounded by screens.', mission: 'Keep your devices longer and repair them when broken.', fact: '80% of a smartphone\\'s carbon footprint comes from manufacturing it.', trigger: ans => ['5to7','8plus'].includes(ans.F3) },
  { id: '🤖', title: 'PROMPT NINJA', text: 'AI usage', habit: 'Heavy AI dependency.', mission: 'Use AI mindfully for complex tasks, not simple searches.', fact: 'A single AI query uses 5-10 times more energy than a Google search.', trigger: ans => ['heavy','regularly'].includes(ans.F2) },
  { id: '🌾', title: 'SMOKE FARMER', text: 'Firewood cooking', habit: 'Cooking over open fire.', mission: 'Switch to cleaner cooking methods like biogas or electric induction.', fact: 'Clean cooking improves household health and reduces deforestation.', trigger: ans => ans.A3 === 'firewood' },
  { id: '🦬', title: 'BUFFALO BOSS', text: 'Livestock', habit: 'Large animal herds.', mission: 'Optimize feed and manage manure effectively to reduce methane.', fact: 'Cattle digestion is a leading source of agricultural methane.', trigger: ans => ['2pluscow','mixed'].includes(ans.C5) },
  { id: '📦', title: 'PLASTIC PIRATE', text: 'Single-use plastic', habit: 'Plastic everywhere.', mission: 'Switch to reusable bags, bottles, and containers.', fact: 'Plastic is made directly from fossil fuels.', trigger: ans => ans.D4 === 'alot' },
  { id: '🌾', title: 'FIELD FLAMER', text: 'Crop burning', habit: 'Burning crop residue.', mission: 'Plow residue back into the soil to improve fertility instead of burning.', fact: 'Crop burning is a major contributor to regional air pollution.', trigger: ans => ['regularly','occasionally'].includes(ans.A6) }
];

const SECONDARY_PERSONAS = [
  { id: '🚶', title: 'WALKING LEGEND', superpower: 'You naturally choose walking. Keep going! Every kilometer walked saves emissions and improves health.', trigger: ans => ans.B1 === 'walk' },
  { id: '🚲', title: 'PEDAL HERO', superpower: 'You power your own transit. Keep going! Cycling is zero-emission and highly efficient.', trigger: ans => ans.B1 === 'bicycle' },
  { id: '⚡', title: 'HYDRO HERO', superpower: 'You cook with clean electric power. Keep going! Nepal’s hydro grid makes this a massive win.', trigger: ans => ans.A3 === 'induction' },
  { id: '🌿', title: 'LOCAL LEGEND', superpower: 'You support local farmers. Keep going! Eating local slashes food transport miles.', trigger: ans => ['mostlylocal','alllocal'].includes(ans.C4) },
  { id: '♻', title: 'CIRCULAR CHAMPION', superpower: 'You manage waste responsibly. Keep going! Composting turns problems into nutrients.', trigger: ans => ans.E1 === 'compost' },
  { id: '🌱', title: 'PLANT PIONEER', superpower: 'You choose plant-based foods. Keep going! This is the most powerful dietary choice for the climate.', trigger: ans => ['vegan','vegetarian'].includes(ans.C1) },
  { id: '🏡', title: 'COZY MINIMALIST', superpower: 'You live efficiently. Keep going! Smaller spaces require less energy and materials.', trigger: ans => ['mud','wood'].includes(ans.A1) },
  { id: '🛍', title: 'THRIFT NINJA', superpower: 'You choose second-hand. Keep going! Reusing goods eliminates manufacturing emissions.', trigger: ans => ['secondhand','mostlysecond'].includes(ans.D3) },
  { id: '🫧', title: 'BIOGAS BOSS', superpower: 'You use renewable cooking gas. Keep going! Biogas solves waste and energy at the same time.', trigger: ans => ans.A3 === 'biogas' }
];

const getIdentity = (total) => {
  if (total <= 1.25) return { title: '🌍 CLIMATE GUARDIAN', color: colors.platinum, desc: 'You are leading the way in protecting our planet.' };
  if (total <= 2.5) return { title: '🌱 CLIMATE STEWARD', color: colors.green, desc: 'You are living within the recommended global climate budget for a 1.5°C future.' };
  if (total <= 4.0) return { title: '🌿 CLIMATE CHALLENGER', color: colors.blue, desc: 'You are making an effort but have room for strategic reductions.' };
  if (total <= 6.0) return { title: '🔥 CLIMATE CATALYST', color: colors.orange, desc: 'Your footprint is above average. Your actions now can catalyze major change.' };
  return { title: '⭐ CLIMATE LEADER IN TRANSITION', color: colors.red, desc: 'You have a high footprint, which means you have the highest potential for impact.' };
};

export default function ClimateReportPDF({ submission, logoDataUri }) {
  const name = submission?.name || 'Traveler';
  const totalRaw = parseFloat(submission?.total_emissions || 0);
  const totalFmt = totalRaw.toFixed(2);
  const idy = getIdentity(totalRaw);

  let bHome = parseFloat(submission?.breakdown_home || 0);
  let bTransport = parseFloat(submission?.breakdown_transport || 0);
  let bFood = parseFloat(submission?.breakdown_food || 0);
  let bGoods = parseFloat(submission?.breakdown_goods || 0);
  let waste = 0;

  let primaryP = PRIMARY_PERSONAS[3]; // Meat Machine default
  let secondaryP = SECONDARY_PERSONAS[9] || { id: '🦋', title: 'PLANET PAL', superpower: 'You keep a wonderfully low footprint. Keep going! Your lifestyle is a model for the future.' };
  
  let actions = [
    { rank: '#1', title: 'Reduce Household Energy', desc: 'Switch to LEDs and turn off appliances.', red: '-150 kg', diff: '⭐⭐', imp: '⭐⭐⭐' },
    { rank: '#2', title: 'Eat Plant-Based', desc: 'Swap meat for plants twice a week.', red: '-200 kg', diff: '⭐⭐⭐', imp: '⭐⭐⭐⭐' },
    { rank: '#3', title: 'Walk Short Journeys', desc: 'Walk for trips under 2km.', red: '-100 kg', diff: '⭐', imp: '⭐⭐' }
  ];

  if (submission?.answers_data) {
    const ans = submission.answers_data;
    const matchedP = PRIMARY_PERSONAS.find(p => p.trigger(ans));
    if (matchedP) primaryP = matchedP;
    
    const matchedS = SECONDARY_PERSONAS.find(p => p.trigger(ans));
    if (matchedS) secondaryP = matchedS;

    // Estimate waste from goods to split it out for the breakdown
    if (ans.E1 === 'compost') waste += 0.02;
    if (ans.E1 === 'municipal') waste += 0.08;
    if (ans.E1 === 'dump') waste += 0.1;
    if (ans.E1 === 'burn') waste += 0.2;
    if (ans.E2 === 'occasionally') waste += 0.05;
    if (ans.E2 === 'regularly') waste += 0.15;
    if (waste > bGoods) waste = bGoods;
    bGoods = Math.max(0, bGoods - waste);
    
    // Dynamic Actions logic
    let dynamicActions = [];
    if (ans.E2 === 'regularly' || ans.E2 === 'occasionally') dynamicActions.push({ title: 'Stop Open Burning', desc: 'Compost organic waste and recycle instead.', red: '-480 kg', diff: '⭐⭐', imp: '⭐⭐⭐⭐⭐' });
    if (ans.A3 === 'firewood' || ans.A3 === 'lpg') dynamicActions.push({ title: 'Switch Cooking to Electricity', desc: 'Use induction stoves powered by clean hydro.', red: '-320 kg', diff: '⭐⭐⭐', imp: '⭐⭐⭐⭐' });
    if (ans.B2 === 'cartaxi') dynamicActions.push({ title: 'Use Public Transit', desc: 'Replace 2 car trips a week with bus or micro.', red: '-250 kg', diff: '⭐⭐', imp: '⭐⭐⭐⭐' });
    if (ans.C1 === 'frequentred') dynamicActions.push({ title: 'Reduce Red Meat', desc: 'Swap beef/mutton for poultry or plants.', red: '-400 kg', diff: '⭐⭐', imp: '⭐⭐⭐⭐' });
    if (ans.B4 === '1long' || ans.B4 === '2pluslong') dynamicActions.push({ title: 'Support Carbon Removal', desc: 'Offset your long-haul flights.', red: '-1000 kg', diff: '⭐', imp: '⭐⭐⭐⭐⭐' });
    
    if (dynamicActions.length > 0) {
      actions = dynamicActions.slice(0, 3).map((a, i) => ({ ...a, rank: \`#\${i+1}\` }));
    }
  }

  const cats = [
    { name: 'Transport', val: bTransport },
    { name: 'Food', val: bFood },
    { name: 'Home', val: bHome },
    { name: 'Consumption', val: bGoods },
    { name: 'Waste', val: waste }
  ].sort((a, b) => b.val - a.val);

  const calcTotal = Math.max(totalRaw, 0.001);

  const Header = () => (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.header}>
        {logoDataUri ? <Image src={logoDataUri} style={styles.logo} /> : <View style={styles.logo} />}
        <Text style={styles.headerRight}>OFFICIAL CLIMATE REPORT{'\n'}{name.toUpperCase()}</Text>
      </View>
      <View style={styles.hr} />
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.sectionTitle}>SECTION 01 / YOUR CLIMATE IDENTITY</Text>
        <View style={[styles.heroCard, { borderColor: idy.color }]}>
          <Text style={[styles.heroIdentity, { color: idy.color }]}>{idy.title}</Text>
          <Text style={styles.heroDesc}>{idy.desc}</Text>
          <Text style={[styles.metricVal, { fontSize: 36, color: colors.darkText, marginBottom: 12 }]}>{totalFmt} <Text style={{fontSize: 12, color: colors.gray}}>tCO2e/year</Text></Text>
          
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>0.6 t</Text>
              <Text style={styles.metricLabel}>🇳🇵 Nepal Avg</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: colors.olive }]}>2.5 t</Text>
              <Text style={[styles.metricLabel, { color: colors.olive }]}>🎯 1.5°C Budget</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>4.7 t</Text>
              <Text style={styles.metricLabel}>🌍 Global Avg</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SECTION 04 / CLIMATE BUDGET EXPLANATION</Text>
        <View style={{ backgroundColor: colors.cardBg, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.darkText, marginBottom: 8 }}>Why 2.5 tonnes?</Text>
          <Text style={{ fontSize: 9, color: colors.gray, lineHeight: 1.4, marginBottom: 12 }}>Climate scientists estimate that to keep global warming close to 1.5°C, every person should aim to stay within approximately 2.5 tonnes of CO2e per year. This number comes from dividing the remaining global carbon budget equally among everyone on Earth. It is a target, not an average.</Text>
          <View style={styles.barRow}><Text style={styles.barLabel}>🇳🇵 Nepal Avg</Text><View style={styles.barTrack}><View style={[styles.barFill, {width: \`\${(0.6/14)*100}%\`, backgroundColor: colors.gray}]}/></View><Text style={styles.barPct}>0.6 t</Text></View>
          <View style={styles.barRow}><Text style={styles.barLabel}>🎯 Budget</Text><View style={styles.barTrack}><View style={[styles.barFill, {width: \`\${(2.5/14)*100}%\`, backgroundColor: colors.olive}]}/></View><Text style={styles.barPct}>2.5 t</Text></View>
          <View style={styles.barRow}><Text style={styles.barLabel}>🌍 Global Avg</Text><View style={styles.barTrack}><View style={[styles.barFill, {width: \`\${(4.7/14)*100}%\`, backgroundColor: colors.gray}]}/></View><Text style={styles.barPct}>4.7 t</Text></View>
          <View style={styles.barRow}><Text style={styles.barLabel}>🇺🇸 USA Avg</Text><View style={styles.barTrack}><View style={[styles.barFill, {width: \`\${(14/14)*100}%\`, backgroundColor: colors.red}]}/></View><Text style={styles.barPct}>14.0 t</Text></View>
        </View>

        <Text style={styles.sectionTitle}>SECTION 05 / YOUR CLIMATE DNA</Text>
        <View style={styles.dnaGrid}>
          <View style={[styles.dnaCard, { marginRight: 10 }]}>
            <Text style={styles.dnaTag}>PRIMARY</Text>
            <Text style={styles.dnaEmoji}>{primaryP.id}</Text>
            <Text style={styles.dnaTitle}>{primaryP.title}</Text>
            <Text style={styles.dnaLabel}>Climate Habit</Text>
            <Text style={styles.dnaText}>"{primaryP.habit}"</Text>
            <Text style={styles.dnaLabel}>Mission</Text>
            <Text style={styles.dnaText}>{primaryP.mission}</Text>
            <Text style={styles.dnaLabel}>Fun Fact</Text>
            <Text style={styles.dnaText}>{primaryP.fact}</Text>
          </View>
          <View style={styles.dnaCard}>
            <Text style={styles.dnaTag}>SECONDARY</Text>
            <Text style={styles.dnaEmoji}>{secondaryP.id}</Text>
            <Text style={styles.dnaTitle}>{secondaryP.title}</Text>
            <Text style={styles.dnaLabel}>Climate Superpower</Text>
            <Text style={styles.dnaText}>{secondaryP.superpower}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SECTION 06 / CARBON BREAKDOWN</Text>
        <View style={{ marginBottom: 20 }}>
          {cats.map((c, i) => {
             const pct = Math.round((c.val / calcTotal) * 100);
             if (pct <= 0) return null;
             return (
               <View key={i} style={styles.barRow}>
                 <Text style={styles.barLabel}>{c.name}</Text>
                 <View style={styles.barTrack}><View style={[styles.barFill, {width: \`\${pct}%\`}]}/></View>
                 <Text style={styles.barPct}>{pct}%</Text>
               </View>
             )
          })}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.sectionTitle}>SECTION 07 / TOP CLIMATE ACTIONS</Text>
        <View style={{ marginBottom: 20 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableTh, { width: 30 }]}>#</Text>
            <Text style={[styles.tableTh, { flex: 2 }]}>ACTION</Text>
            <Text style={[styles.tableTh, { flex: 1 }]}>REDUCTION</Text>
            <Text style={[styles.tableTh, { flex: 1 }]}>DIFFICULTY</Text>
          </View>
          {actions.map((a, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={{ width: 30, fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.olive }}>{a.rank}</Text>
              <View style={{ flex: 2, paddingRight: 10 }}>
                <Text style={styles.tableCellTitle}>{a.title}</Text>
                <Text style={styles.tableCellDesc}>{a.desc}</Text>
              </View>
              <Text style={[styles.tableCellTitle, { flex: 1, color: colors.olive }]}>{a.red}</Text>
              <Text style={{ flex: 1, fontSize: 8 }}>{a.diff}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>SECTION 08 / CLIMATE ROADMAP</Text>
        <View style={{ backgroundColor: colors.cardBg, padding: 20, marginBottom: 20 }}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
            <View style={styles.timelineContent}>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.darkText, marginLeft: 20 }}>{totalFmt} tCO2e</Text>
              <Text style={{ fontSize: 8, color: colors.gray, marginLeft: 20, marginTop: 2 }}>CURRENT FOOTPRINT</Text>
            </View>
          </View>
          {actions.map((a, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.border }]} />
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={{ fontSize: 10, color: colors.darkText, marginLeft: 20 }}>↓ {a.title}</Text>
              </View>
            </View>
          ))}
          <View style={[styles.timelineItem, { marginBottom: 0 }]}>
            <View style={[styles.timelineDot, { backgroundColor: colors.olive, width: 12, height: 12, left: 4, top: 2 }]} />
            <View style={styles.timelineContent}>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.olive, marginLeft: 20 }}>NET ZERO</Text>
              <Text style={{ fontSize: 8, color: colors.gray, marginLeft: 20, marginTop: 2 }}>LONG TERM GOAL</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SECTION 09 / CLIMATE PLEDGE</Text>
        <View style={styles.pledgeBox}>
          <Text style={styles.pledgeText}>
            I understand that every journey, meal, purchase and conversation has an impact on our planet.{'\\n\\n'}
            I pledge to measure my footprint, reduce it where possible, inspire others through my actions and become part of the solution.{'\\n\\n'}
            Climate action is not perfection.{'\\n'}
            It is progress.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <View style={{ width: 12, height: 12, borderWidth: 1, borderColor: colors.darkText, marginRight: 8, backgroundColor: colors.darkText }} />
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.darkText }}>I take this pledge.</Text>
          </View>
          <View style={{ marginTop: 20, borderBottomWidth: 1, borderBottomColor: colors.border, width: 200, paddingBottom: 4 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.olive }}>{name}</Text>
          </View>
          <Text style={{ fontSize: 8, color: colors.gray, marginTop: 4 }}>DIGITAL SIGNATURE</Text>
        </View>
      </Page>
    </Document>
  );
}
`;

fs.writeFileSync(targetPath, code);
console.log('Successfully wrote new ClimateReportPDF.js');
