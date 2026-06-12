// Single source of truth for everything a full climate report renders.
// Both report templates (the editorial ClimateReportPDF and the minimalist
// ClimateReportMinimal) consume buildReportModel() so their numbers, personas,
// identity tiers and actions can never drift apart. Colours stay in the
// templates — this module is purely data + derivation.

import { calculateFootprint } from './scoring';

/* ---------------- IDENTITY TIERS ---------------- */
export const IDENTITY_TIERS = [
  { title: 'CLIMATE GUARDIAN', min: 0, max: 1.25, desc: 'You protect more than you consume. Keep inspiring others.' },
  { title: 'CLIMATE STEWARD', min: 1.25, max: 2.5, desc: 'You are living within the recommended global climate budget for a 1.5°C future.' },
  { title: 'CLIMATE CHALLENGER', min: 2.5, max: 4.0, desc: 'You are making an effort but have room for strategic reductions.' },
  { title: 'CLIMATE CATALYST', min: 4.0, max: 6.0, desc: 'Your footprint is above average. Your actions now can catalyse major change.' },
  { title: 'CLIMATE LEADER IN TRANSITION', min: 6.0, max: Infinity, desc: 'You have a high footprint, which means you hold the highest potential for impact.' },
];

export const fmtTierRange = (tier) =>
  tier.max === Infinity ? `${tier.min.toFixed(2)}+ t` : `${tier.min.toFixed(2)}–${tier.max.toFixed(2)} t`;

const getIdentity = (t) => IDENTITY_TIERS.find((tier) => t <= tier.max) || IDENTITY_TIERS[IDENTITY_TIERS.length - 1];

/* ---------------- PERSONAS ---------------- */
export const PRIMARY_PERSONAS = [
  { title: 'FIRE STARTER', habit: 'If it burns, it disappears.', mission: 'Turn smoke into soil by composting, recycling or making biochar.', fact: 'Your plants would rather eat compost than breathe smoke.', basis: 'you openly burn household trash', metricCat: 'waste', trigger: a => a.E2 === 'regularly' || a.E2 === 'occasionally' || a.E1 === 'burn' },
  { title: 'ROAD WARRIOR', habit: 'Always on the move.', mission: 'Build public transit or walking into your weekly routine.', fact: 'Carpooling cuts your transport emissions in half immediately.', basis: 'a private car or motorbike covers most of your travel', metricCat: 'transport', trigger: a => ['car_under100', 'car_100to300', 'moto_under50', 'moto_50to150'].includes(a.B2) },
  { title: 'SKY NOMAD', habit: 'Frequent air travel.', mission: 'Combine trips, fly less often, and support verified carbon removal.', fact: 'A single long-haul flight can double an average footprint.', basis: 'your international flights dominate your travel', metricCat: 'transport', trigger: a => ['1long', '2pluslong', '1medium'].includes(a.B4) },
  { title: 'MEAT MACHINE', habit: 'High meat consumption.', mission: 'Try plant-based meals a few days a week.', fact: 'Plant-based diets need about 75% less land than meat-heavy diets.', basis: 'meat features heavily in your diet', metricCat: 'food', trigger: a => ['frequentred', 'regularmeat'].includes(a.C1) },
  { title: 'CONCRETE KING', habit: 'Built with cement, brick and steel.', mission: 'Renovate rather than rebuild; cement alone is about 8% of global CO₂.', fact: 'Concrete production accounts for roughly 8% of global CO₂ emissions.', basis: 'your home is built from cement, brick and steel', metricCat: 'homeEnergy', trigger: a => a.A1 === 'concrete' },
  { title: 'RETAIL ROCKSTAR', habit: 'Frequent new purchases.', mission: 'Buy durable or second-hand goods and consume mindfully.', fact: "Extending a product's life by 9 months cuts its footprint by about 20%.", basis: 'you buy a high volume of new clothing', metricCat: 'shopping', trigger: a => a.D1 === '30plus' },
  { title: 'DIGITAL DRAGON', habit: 'Surrounded by screens.', mission: 'Keep your devices longer and repair them when broken.', fact: "About 80% of a phone's footprint comes from making it.", basis: 'your household owns many devices', metricCat: 'digital', trigger: a => ['5to7', '8plus'].includes(a.F3) },
  { title: 'PROMPT NINJA', habit: 'Heavy AI dependency.', mission: 'Use AI for complex tasks, not simple lookups.', fact: 'A single AI query can use several times more energy than a web search.', basis: 'you lean heavily on energy-hungry AI tools', metricCat: 'digital', trigger: a => ['heavy', 'regularly'].includes(a.F2) },
  { title: 'SMOKE FARMER', habit: 'Cooking over open fire.', mission: 'Switch to cleaner cooking like biogas or electric induction.', fact: 'Clean cooking improves household health and reduces deforestation.', basis: 'you cook over an open firewood fire', metricCat: 'cooking', trigger: a => a.A3 === 'firewood' },
  { title: 'BUFFALO BOSS', habit: 'Large animal herds.', mission: 'Optimise feed and manage manure to reduce methane.', fact: 'Cattle digestion is a leading source of agricultural methane.', basis: 'you keep cattle or buffalo, a major methane source', metricCat: 'food', trigger: a => ['1cow', '2pluscow', 'mixed'].includes(a.C5) },
  { title: 'PLASTIC PIRATE', habit: 'Plastic everywhere.', mission: 'Switch to reusable bags, bottles and containers.', fact: 'Plastic is made directly from fossil fuels.', basis: 'single-use plastic is a constant in your household', metricCat: 'shopping', trigger: a => a.D4 === 'alot' },
  { title: 'FIELD FLAMER', habit: 'Burning crop residue.', mission: 'Plough residue back into the soil instead of burning it.', fact: 'Crop burning is a major source of regional air pollution.', basis: 'you burn crop residue in the fields', metricCat: 'agBurning', trigger: a => ['regularly', 'occasionally'].includes(a.A6) },
];

export const SECONDARY_PERSONAS = [
  { title: 'WALKING LEGEND', superpower: 'You walk for daily trips. Every kilometre saves emissions and improves health.', basis: 'you walk for your daily commute', metricCat: 'transport', trigger: a => a.B1 === 'walking' },
  { title: 'PEDAL HERO', superpower: 'You power your own transit. Cycling is zero-emission and highly efficient.', basis: 'you cycle instead of using fuel', metricCat: 'transport', trigger: a => a.B1 === 'bicycle' },
  { title: 'HYDRO HERO', superpower: "You cook with clean electric power. Nepal's hydro grid makes this a big win.", basis: 'you cook on clean electric induction', metricCat: 'cooking', trigger: a => a.A3 === 'induction' },
  { title: 'LOCAL LEGEND', superpower: 'You support local farmers. Eating local slashes food transport miles.', basis: 'you source food from home or local markets', metricCat: 'food', trigger: a => ['home', 'local'].includes(a.C3) },
  { title: 'CIRCULAR CHAMPION', superpower: 'You manage waste responsibly. Composting turns problems into nutrients.', basis: 'you compost and recycle your waste', metricCat: 'waste', trigger: a => a.E1 === 'compost' },
  { title: 'PLANT PIONEER', superpower: 'You choose plant-based foods, the single most powerful dietary choice.', basis: 'you eat a plant-based diet', metricCat: 'food', trigger: a => a.C1 === 'veg' },
  { title: 'COZY MINIMALIST', superpower: 'You live efficiently. Smaller spaces need less energy and material.', basis: 'you live in a low-carbon traditional home', metricCat: 'homeEnergy', trigger: a => a.A1 === 'traditional' },
  { title: 'THRIFT NINJA', superpower: 'You choose second-hand. Reusing goods avoids manufacturing emissions.', basis: 'you buy second-hand instead of new', metricCat: 'shopping', trigger: a => ['often', 'sometimes'].includes(a.D2) },
  { title: 'BIOGAS BOSS', superpower: 'You use renewable cooking gas. Biogas solves waste and energy at once.', basis: 'you cook with renewable biogas', metricCat: 'cooking', trigger: a => a.A3 === 'biogas' },
  { title: 'PLANET PAL', superpower: 'You keep a wonderfully low footprint. Your lifestyle models the future.', basis: 'your overall footprint is impressively low', metricCat: null, trigger: () => true },
];

// Generic per-category personas. Used ONLY as a fallback when a respondent's BIGGEST
// category has no specific behaviour persona that triggered (e.g. Food is dominated by
// flooded-paddy rice or food waste rather than meat; Transport by a motorbike that no
// longer slips past Road Warrior; Cooking by LPG/kerosene rather than firewood). This
// guarantees the primary persona can never contradict the largest footprint category.
export const CATEGORY_FALLBACK = {
  cooking: { title: 'KITCHEN FURNACE', habit: 'Your kitchen runs hot.', mission: 'Shift daily cooking toward electric induction or biogas.', fact: 'Clean cooking cuts both emissions and indoor air pollution.', basis: 'cooking fuel is your single largest source', metricCat: 'cooking' },
  homeEnergy: { title: 'ENERGY BARON', habit: 'Your home draws a heavy load.', mission: 'Insulate, choose efficient appliances and clean heating.', fact: 'Building materials and heating lock in carbon for decades.', basis: 'your home and heating dominate your footprint', metricCat: 'homeEnergy' },
  agBurning: { title: 'SMOKE SIGNAL', habit: 'Smoke rises from your fields.', mission: 'Plough crop residue back into the soil instead of burning it.', fact: 'Crop burning is a major source of regional air pollution.', basis: 'agricultural burning is your largest source', metricCat: 'agBurning' },
  transport: { title: 'MILE MASTER', habit: 'The road defines your days.', mission: 'Shift trips to public transit, cycling or shared rides.', fact: 'Transport is one of the fastest-growing emission sources.', basis: 'getting around is your largest source', metricCat: 'transport' },
  food: { title: 'FEAST BARON', habit: 'Your plate carries weight.', mission: 'Cut food waste, choose local produce and lighter proteins.', fact: 'Food systems drive roughly a third of global emissions.', basis: 'food is your largest footprint category', metricCat: 'food' },
  shopping: { title: 'CART COMMANDER', habit: 'New things keep arriving.', mission: 'Buy durable or second-hand goods and consume mindfully.', fact: "Most of a product's carbon is locked in before you buy it.", basis: 'buying goods is your largest source', metricCat: 'shopping' },
  waste: { title: 'WASTE WRANGLER', habit: 'Your bins fill quickly.', mission: 'Compost organic waste and cut single-use items.', fact: 'Organic waste in dumps releases methane, a potent greenhouse gas.', basis: 'waste and water are your largest source', metricCat: 'waste' },
  digital: { title: 'SCREEN SOVEREIGN', habit: 'Screens surround you.', mission: 'Keep devices longer and stream a little less.', fact: "Most of a device's carbon comes from manufacturing it.", basis: 'your digital life is your largest source', metricCat: 'digital' },
};

/* ---------------- CATEGORIES + BENCHMARKS ---------------- */
export const CATEGORY_KEYS = ['cooking', 'homeEnergy', 'agBurning', 'transport', 'food', 'shopping', 'waste', 'digital'];
export const CATEGORY_LABELS = {
  cooking: 'Cooking', homeEnergy: 'Home & Energy', agBurning: 'Agricultural Burning', transport: 'Transport',
  food: 'Food', shopping: 'Shopping', waste: 'Waste & Water', digital: 'Digital',
};

export const BENCHMARKS = [
  { label: 'Nepal average', val: 0.6 },
  { label: 'India', val: 2.0 },
  { label: '1.5°C budget', val: 2.5, target: true },
  { label: 'Global average', val: 4.7 },
  { label: 'USA', val: 14.0 },
];

const num = (x) => { const n = parseFloat(x); return Number.isFinite(n) ? n : 0; };

/* ---------------- MODEL BUILDER ---------------- */
export function buildReportModel(submission) {
  const name = submission?.name || 'Traveler';
  const totalRaw = num(submission?.total_emissions);
  const totalFmt = totalRaw.toFixed(2);
  const calcTotal = Math.max(totalRaw, 0.001);
  const idy = getIdentity(totalRaw);

  // Exact per-category breakdown (tonnes). When answers exist we ALWAYS recompute from them,
  // so the on-screen report, the PDF and the certificate are guaranteed to agree — a persisted
  // breakdown_detail written by an older scoring version can never make the screen and PDF
  // disagree. Persisted breakdown_detail is used only when raw answers are unavailable; legacy
  // four-bucket fields are the last resort.
  const ans = submission?.answers_data || null;
  let D;
  if (ans) {
    const eng = calculateFootprint(ans, ans.GQ1);
    D = Object.fromEntries(Object.entries(eng.breakdown).map(([k, v]) => [k, v / 1000]));
  } else if (submission?.breakdown_detail && typeof submission.breakdown_detail === 'object') {
    D = submission.breakdown_detail;
  } else {
    D = {
      cooking: 0, homeEnergy: num(submission?.breakdown_home), agBurning: 0,
      transport: num(submission?.breakdown_transport), food: num(submission?.breakdown_food),
      shopping: num(submission?.breakdown_goods), waste: 0, digital: 0,
      flights: 0, vehicle: 0, diet: 0, foodWaste: 0, livestock: 0,
    };
  }

  const cooking = num(D.cooking), homeEnergy = num(D.homeEnergy), agBurning = num(D.agBurning);
  const transport = num(D.transport), food = num(D.food), shopping = num(D.shopping);
  const waste = num(D.waste), digital = num(D.digital);

  const categories = CATEGORY_KEYS
    .map((key) => ({ key, name: CATEGORY_LABELS[key], val: num(D[key]) }))
    .sort((a, b) => b.val - a.val);

  const catValueByKey = { cooking, homeEnergy, agBurning, transport, food, shopping, waste, digital };

  // Personas. The primary persona is anchored to your BIGGEST footprint category, so it can
  // never contradict the chart (the recurring "my biggest is Food but it calls me Concrete
  // King" complaint). Selection works top-down:
  //   1. Find the largest category overall (categories[0]).
  //   2. If a behaviour persona triggered within that category, use it — and where several
  //      share the category (Sky Nomad vs Road Warrior in transport; Meat Machine vs Buffalo
  //      Boss in food) the sub-driver (flights/vehicle/diet/livestock) breaks the tie so the
  //      genuinely dominant behaviour wins.
  //   3. Otherwise fall back to the generic persona for that category (Feast Baron, Energy
  //      Baron, …) so the headline still reflects the largest category.
  //   4. Only if the biggest category is effectively zero do we drop to the strongest matched
  //      persona by category total.
  // Each driver is a like-for-like slice of its own category, so the tiebreak is fair (e.g.
  // Buffalo Boss is weighted by its livestock slice, not the whole food total).
  const PERSONA_DRIVER = { 'SKY NOMAD': 'flights', 'ROAD WARRIOR': 'vehicle', 'MEAT MACHINE': 'diet', 'BUFFALO BOSS': 'livestock' };
  const catWeight = (p) => num(catValueByKey[p.metricCat]);
  const subWeight = (p) => num(PERSONA_DRIVER[p.title] ? D[PERSONA_DRIVER[p.title]] : catValueByKey[p.metricCat]);

  let primaryP = CATEGORY_FALLBACK.food;
  let secondaryP = SECONDARY_PERSONAS[SECONDARY_PERSONAS.length - 1];
  if (ans) {
    const matched = PRIMARY_PERSONAS.filter((p) => p.trigger(ans));
    const topCat = categories[0];
    const topKey = topCat && topCat.val > 0.0001 ? topCat.key : null;
    const inTopCat = topKey ? matched.filter((p) => p.metricCat === topKey) : [];
    if (inTopCat.length) {
      primaryP = inTopCat.reduce((best, p) => (subWeight(p) > subWeight(best) ? p : best));
    } else if (topKey && CATEGORY_FALLBACK[topKey]) {
      primaryP = CATEGORY_FALLBACK[topKey];
    } else if (matched.length) {
      primaryP = matched.reduce((best, p) => (catWeight(p) > catWeight(best) ? p : best));
    }
    // Secondary stays priority-ordered — it celebrates your strongest low-carbon habit.
    const mS = SECONDARY_PERSONAS.find((p) => p.trigger(ans));
    if (mS) secondaryP = mS;
  }
  const personaMetric = (p) => {
    if (!p || !p.metricCat) return { label: 'Total footprint', kg: Math.round(calcTotal * 1000), pct: 100 };
    const v = catValueByKey[p.metricCat] ?? 0;
    return { label: CATEGORY_LABELS[p.metricCat] || '', kg: Math.round(v * 1000), pct: Math.round((v / calcTotal) * 100) };
  };
  const primaryMetric = personaMetric(primaryP);
  const secondaryMetric = personaMetric(secondaryP);

  // Personalized actions, with reduction estimates drawn from the EXACT category values.
  let dyn = [];
  if (ans) {
    if (ans.E2 === 'regularly' || ans.E2 === 'occasionally') dyn.push({ cat: 'waste', title: 'Stop open burning of trash', desc: 'Compost or recycle waste instead of burning it.', redVal: waste, diff: 2, imp: 5 });
    if (agBurning > 0.01) dyn.push({ cat: 'agburning', title: 'Stop agricultural burning', desc: 'Use crop residue for composting or animal feed.', redVal: agBurning, diff: 3, imp: 5 });
    if (ans.A3 === 'firewood' || ans.A3 === 'lpg' || ans.A3 === 'kerosene') dyn.push({ cat: 'cooking', title: 'Switch cooking to electricity', desc: "Use induction on Nepal's clean hydro grid.", redVal: cooking, diff: 3, imp: 4 });
    if (ans.A4 === 'traditional' && ans.A3 === 'firewood') dyn.push({ cat: 'cooking', title: 'Upgrade to an improved cookstove', desc: 'Cut fuel use and indoor smoke with an efficient stove.', redVal: cooking, diff: 2, imp: 4 });
    if (['car_under100', 'car_100to300', 'moto_under50', 'moto_50to150'].includes(ans.B2)) dyn.push({ cat: 'transport', title: 'Use public transit or carpool', desc: 'Replace solo vehicle trips with buses or shared rides.', redVal: num(D.vehicle) * 0.5, diff: 2, imp: 4 });
    if (ans.C1 === 'frequentred') dyn.push({ cat: 'food', title: 'Reduce red meat consumption', desc: 'Swap a few red-meat meals each week for plant-based ones.', redVal: num(D.diet) * 0.3, diff: 2, imp: 4 });
    if (ans.C1 === 'regularmeat') dyn.push({ cat: 'food', title: 'Try one meatless day per week', desc: 'Small dietary shifts significantly lower agricultural emissions.', redVal: num(D.diet) * 0.15, diff: 1, imp: 3 });
    if (num(D.flights) > 0.05) dyn.push({ cat: 'flights', title: 'Fly less and combine trips', desc: 'Replace some flights with rail or virtual meetings, and combine trips when you must fly.', redVal: num(D.flights) * 0.5, diff: 3, imp: 5 });
    if (num(D.flights) > 0.05) dyn.push({ cat: 'offset', title: 'Support carbon removal projects', desc: 'Offset the flights you cannot avoid through verified biochar or carbon removal.', redVal: num(D.flights) * 0.5, diff: 1, imp: 4, offset: true });
    if (ans.F3 === '1to2' || ans.F3 === '3to4') dyn.push({ cat: 'digital', title: 'Keep your devices a year longer', desc: 'Delay replacing phones and laptops to skip manufacturing emissions.', redVal: digital, diff: 1, imp: 2 });
    if (ans.E1 === 'burn' || ans.E1 === 'dump') dyn.push({ cat: 'waste', title: 'Start composting organic waste', desc: 'Divert food scraps from dumps and open burning.', redVal: waste, diff: 2, imp: 3 });
    if (ans.C3 === 'packaged' || ans.C3 === 'supermarket') dyn.push({ cat: 'food', title: 'Buy local and seasonal produce', desc: 'Reduce transportation emissions from imported grocery goods.', redVal: num(D.diet) * 0.2, diff: 2, imp: 3 });
    if (ans.C2 === 'alot' || ans.C2 === 'moderate') dyn.push({ cat: 'food', title: 'Reduce food waste', desc: 'Plan meals better to throw away less edible food.', redVal: num(D.foodWaste) * 0.5, diff: 2, imp: 3 });
  }

  let footprintBasedActions = [];
  if (cooking > 0.01) footprintBasedActions.push({ cat: 'cooking', title: 'Cook with cleaner fuel', desc: 'Shift toward electric induction or biogas to lower cooking emissions.', redVal: cooking * 0.15, diff: 2, imp: 3 });
  if (homeEnergy > 0.01) footprintBasedActions.push({ cat: 'home', title: 'Reduce home energy consumption', desc: 'Implement energy-saving habits like turning off lights and using efficient appliances.', redVal: homeEnergy * 0.15, diff: 1, imp: 2 });
  if (transport > 0.01) footprintBasedActions.push({ cat: 'transport', title: 'Optimize your daily transit', desc: 'Walk, cycle, or carpool for short trips to cut down on fuel use.', redVal: transport * 0.15, diff: 2, imp: 3 });
  if (food > 0.01) footprintBasedActions.push(
    ans && ans.C1 === 'veg'
      // Already vegetarian — "eat more plant-based" is wrong. Their remaining food footprint is
      // dairy, flooded-paddy rice and food waste, so target those instead.
      ? { cat: 'food', title: 'Trim your remaining food footprint', desc: 'Cut food waste and choose local, seasonal produce to lower your food emissions.', redVal: food * 0.15, diff: 2, imp: 3 }
      : { cat: 'food', title: 'Shift towards lower-impact foods', desc: 'Incorporate more plant-based meals into your weekly diet.', redVal: food * 0.15, diff: 2, imp: 3 });
  if (shopping > 0.01) footprintBasedActions.push({ cat: 'goods', title: 'Consume mindfully and buy less', desc: 'Extend the life of your products and buy second-hand when possible.', redVal: shopping * 0.15, diff: 1, imp: 2 });
  if (digital > 0.01) footprintBasedActions.push({ cat: 'digital', title: 'Clean up your digital footprint', desc: 'Keep devices longer and reduce unnecessary cloud storage.', redVal: digital * 0.15, diff: 1, imp: 2 });
  if (waste > 0.01) footprintBasedActions.push({ cat: 'waste', title: 'Reduce, reuse, and recycle', desc: 'Minimize single-use plastics and compost organic waste.', redVal: waste * 0.15, diff: 2, imp: 2 });

  // Offsets (carbon removal) are a last resort: keep them OUT of the impact ranking and
  // pin them to the end, so genuine reductions always lead the list.
  const reductions = dyn.filter((a) => !a.offset);
  const offsets = dyn.filter((a) => a.offset);

  footprintBasedActions.sort((a, b) => b.redVal - a.redVal);
  for (const def of footprintBasedActions) {
    if (reductions.length + offsets.length >= 5) break;
    if (!reductions.find((a) => a.cat === def.cat)) reductions.push(def);
  }
  if (reductions.length + offsets.length < 5) {
    for (const def of footprintBasedActions) {
      if (reductions.length + offsets.length >= 5) break;
      if (!reductions.find((a) => a.title === def.title)) reductions.push(def);
    }
  }

  // Rank reductions by impact; reserve the trailing slot(s) for offsets, then number them.
  const rankedReductions = [...reductions].sort((a, b) => b.redVal - a.redVal);
  const slots = Math.max(0, 5 - offsets.length);
  const ordered = [...rankedReductions.slice(0, slots), ...offsets].slice(0, 5);
  let actions = ordered.map((a, i) => ({ ...a, red: `−${Math.round(a.redVal * 1000)} kg CO₂/yr`, rank: `#${i + 1}` }));

  // Roadmap: today → top 4 actions cumulatively → carbon removal to net zero
  let running = calcTotal;
  const roadmap = [{ label: 'Today', val: calcTotal }];
  actions.slice(0, 4).forEach((a) => {
    running = Math.max(0, running - a.redVal);
    roadmap.push({ label: a.title, val: running });
  });

  let red3 = 0;
  actions.slice(0, 3).forEach((a) => { red3 += a.redVal; });
  const projected = Math.max(0, calcTotal - red3).toFixed(2);

  return {
    name, totalRaw, totalFmt, calcTotal,
    idy, tiers: IDENTITY_TIERS,
    breakdown: D, categories,
    primaryP, secondaryP, primaryMetric, secondaryMetric,
    actions, roadmap,
    benchmarks: BENCHMARKS, benchMax: Math.max(14, calcTotal),
    multNepal: (calcTotal / 0.6).toFixed(1),
    withinBudget: calcTotal <= 2.5,
    trees: Math.round((calcTotal * 1000) / 25),
    projected,
  };
}
