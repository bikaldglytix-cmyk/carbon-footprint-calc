import efData from '../data/emission-factors.json';

/*
 * CRITICAL SCORING RULES (kept consistent with the developer worksheet, Part 3):
 *
 * PER-CAPITA CONVERSION (GQ3):
 *   Per-capita score = (Σ household questions ÷ GQ3) + Σ individual questions.
 *   Household questions are shared across the home and divided ONCE by household
 *   size (GQ3). Individual questions describe the respondent's own behaviour and
 *   are added directly. The household / individual split lives in
 *   emission-factors.json -> perCapita. GQ3 = 1 (or unknown) means division is a
 *   no-op. Larger families => lower shared-resource score per person (correct).
 *
 * DOMAIN-SPECIFIC RULES:
 *   1. A1 (construction) is scaled by the A2 home-size multiplier, then treated
 *      as a household question (amortised, shared) and divided by GQ3.
 *   2. A3 firewood is region-dependent (GQ2) and COOKING-ONLY.
 *   3. A3 LPG scores 0 here — LPG cooking is counted via A5 (cylinder count).
 *   4. A3 "mixed" = regional firewood × retentionFactor (−26%) × A4 stove
 *      multiplier; the LPG part of a mixed household is counted separately in A5.
 *   5. A4 stove type is a MULTIPLIER on A3's biomass value (firewood or mixed).
 *   6. A5 "custom" = cylinders/month × lpgPerCylinderAnnual (508.8 kg/yr).
 *   7. A7 (electricity) is 0 for now (clean hydro grid; import factor pending).
 *   8. A8 heating is region-dependent (GQ1) SEASON TOTALS applied EXACTLY ONCE.
 *   9. B1 "own motorbike/car" scores 0 (counted in B2 to avoid double-counting).
 *  10. C3 (food source) and D2 (second-hand) are MULTIPLIERS on other questions.
 */

const C = efData.constants || {};
const LPG_PER_CYLINDER_ANNUAL = C.lpgPerCylinderAnnual ?? 508.8;
const AVG_DWELLING_M2 = C.avgDwellingM2 ?? 55.3;
const AVG_DWELLING_ROOMS = C.avgDwellingRooms ?? 4.8;
const MIXED_FIREWOOD_RETENTION = C.mixedFirewoodRetentionFactor ?? 0.74;

export function calculateFootprint(answers = {}, region) {
  const gq1 = answers.GQ1 || region || 'terai';
  const gq2 = answers.GQ2 || 'urban';

  // --- Household size (GQ3) for per-capita conversion ---
  let gq3 = 1;
  if (answers.GQ3 === 'custom') {
    gq3 = parseFloat(answers.GQ3_value);
  } else if (answers.GQ3) {
    gq3 = parseInt(answers.GQ3, 10);
  }
  if (!gq3 || Number.isNaN(gq3) || gq3 < 1) gq3 = 1;

  const getRaw = (q, ans) => {
    if (!ans) return 0;
    const qData = efData.questions[q];
    if (!qData) return 0;
    const opt = qData.options[ans];
    if (!opt) return 0;
    if (opt.value !== undefined) return opt.value;
    if (opt.values) {
      if (q === 'A3') return opt.values[gq2] || 0;
      if (q === 'A8') return opt.values[gq1] || 0;
    }
    return 0;
  };

  // ===== Domain A — Cooking & Home Energy =====

  // A4 stove multiplier applies to biomass cooking (firewood / mixed).
  let a4Mult = 1.0;
  if (answers.A4 && efData.questions.A4.options[answers.A4]) {
    a4Mult = efData.questions.A4.options[answers.A4].multiplier;
  }

  // A1 × A2 (home construction, amortised over 50 yr, scaled by home size).
  let a1Val = getRaw('A1', answers.A1);
  let a2Mult = 1.0;
  const a2Value = parseFloat(answers.A2_value);
  if (answers.A2 === 'actual' && !Number.isNaN(a2Value)) {
    a2Mult = a2Value / AVG_DWELLING_M2;
  } else if (answers.A2 === 'custom_rooms' && !Number.isNaN(a2Value)) {
    a2Mult = a2Value / AVG_DWELLING_ROOMS;
  } else if (answers.A2 && efData.questions.A2.options[answers.A2]) {
    a2Mult = efData.questions.A2.options[answers.A2].multiplier ?? 1.0;
  }
  if (Number.isNaN(a2Mult) || a2Mult < 0) a2Mult = 1.0;
  a1Val *= a2Mult;

  // A3 cooking fuel.
  let a3Val = 0;
  if (answers.A3 === 'firewood') {
    a3Val = getRaw('A3', 'firewood') * a4Mult;
  } else if (answers.A3 === 'mixed') {
    // Mixed = regional firewood reduced 26% (LPG supplements) × stove multiplier.
    const regionalFirewood = efData.questions.A3.options.firewood.values[gq2] || 0;
    const retention = efData.questions.A3.options.mixed.retentionFactor ?? MIXED_FIREWOOD_RETENTION;
    a3Val = regionalFirewood * retention * a4Mult;
  } else if (answers.A3 === 'lpg') {
    a3Val = 0; // counted in A5
  } else {
    a3Val = getRaw('A3', answers.A3);
  }

  // A5 LPG cylinders (custom = cylinders/month × annual-per-cylinder).
  let a5Val;
  if (answers.A5 === 'custom') {
    a5Val = (parseFloat(answers.A5_value) || 0) * LPG_PER_CYLINDER_ANNUAL;
  } else {
    a5Val = getRaw('A5', answers.A5);
  }

  const a6Val = getRaw('A6', answers.A6); // agricultural burning
  const a8Val = getRaw('A8', answers.A8); // winter heating
  const aHousehold = a1Val + a3Val + a5Val + a6Val + a8Val;
  const aIndividual = getRaw('A7', answers.A7);

  // ===== Domain B — Transport =====
  const bHousehold = getRaw('B2', answers.B2);
  const bIndividual =
    getRaw('B1', answers.B1) +
    getRaw('B3', answers.B3) +
    getRaw('B4', answers.B4) +
    getRaw('B5', answers.B5);

  // ===== Domain C — Food & Diet (C3 = food-source multiplier on all food) =====
  // Household: C2 food waste + C4 rice + C5 livestock. Individual: C1 diet.
  let c3Mult = 1.0;
  if (answers.C3 && efData.questions.C3.options[answers.C3]) {
    c3Mult = efData.questions.C3.options[answers.C3].multiplier;
  }
  const cHousehold =
    (getRaw('C2', answers.C2) + getRaw('C4', answers.C4) + getRaw('C5', answers.C5)) * c3Mult;
  const cIndividual = getRaw('C1', answers.C1) * c3Mult;

  // ===== Domain D — Shopping (D2 = second-hand multiplier on D1 & D3) =====
  let d2Mult = 1.0;
  if (answers.D2 && efData.questions.D2.options[answers.D2]) {
    d2Mult = efData.questions.D2.options[answers.D2].multiplier;
  }
  const dHousehold = getRaw('D1', answers.D1) * d2Mult + getRaw('D4', answers.D4);
  const dIndividual = getRaw('D3', answers.D3) * d2Mult;

  // ===== Domain E — Waste & Water =====
  const eHousehold = getRaw('E1', answers.E1) + getRaw('E2', answers.E2) + getRaw('E3', answers.E3);
  const eIndividual = getRaw('E4', answers.E4);

  // ===== Domain F — Digital & AI =====
  const fHousehold = getRaw('F3', answers.F3) + getRaw('F4', answers.F4);
  const fIndividual = getRaw('F1', answers.F1) + getRaw('F2', answers.F2);

  // Per-capita: divide each household subtotal ONCE by GQ3, add individual directly.
  const byDomain = {
    A: aHousehold / gq3 + aIndividual,
    B: bHousehold / gq3 + bIndividual,
    C: cHousehold / gq3 + cIndividual,
    D: dHousehold / gq3 + dIndividual,
    E: eHousehold / gq3 + eIndividual,
    F: fHousehold / gq3 + fIndividual,
  };

  const total = byDomain.A + byDomain.B + byDomain.C + byDomain.D + byDomain.E + byDomain.F;

  // Named, per-capita-adjusted breakdown (kg/yr). The eight "category" fields are
  // exact slices of byDomain and therefore sum to `total` precisely:
  //   cooking + homeEnergy + agBurning  === byDomain.A
  //   transport/food/shopping/waste/digital === byDomain.B/C/D/E/F
  // The remaining fields (flights, vehicle, diet, foodWaste) are sub-slices already
  // contained in the categories above, surfaced only for targeted action estimates.
  const breakdown = {
    cooking: (a3Val + a5Val) / gq3,
    homeEnergy: (a1Val + a8Val) / gq3 + aIndividual,
    agBurning: a6Val / gq3,
    transport: byDomain.B,
    food: byDomain.C,
    shopping: byDomain.D,
    waste: byDomain.E,
    digital: byDomain.F,
    // sub-slices (not separate categories) for action targeting
    flights: getRaw('B3', answers.B3) + getRaw('B4', answers.B4),
    vehicle: bHousehold / gq3,
    diet: getRaw('C1', answers.C1) * c3Mult,
    foodWaste: (getRaw('C2', answers.C2) * c3Mult) / gq3,
    livestock: (getRaw('C5', answers.C5) * c3Mult) / gq3,
  };

  let topDomain = 'A';
  let max = -Infinity;
  for (const [dom, val] of Object.entries(byDomain)) {
    if (val > max) {
      max = val;
      topDomain = dom;
    }
  }

  return {
    total,
    byDomain,
    breakdown,
    topDomain,
    householdSize: gq3,
    comparisons: {
      nepalAverage: efData.baselines.nepalAverage,
      globalAverage: efData.baselines.globalAverage,
    },
  };
}
