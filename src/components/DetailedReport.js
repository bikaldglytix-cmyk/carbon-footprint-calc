"use client";
import { useState } from 'react';
import styles from './DetailedReport.module.css';
import { buildReportModel } from '../lib/reportModel';

// On-screen-only display maps. Persona/identity SELECTION and all copy come from the
// shared model (buildReportModel), so the results screen matches the PDF report and
// certificate exactly; these maps only add emojis/colours for the web styling.
const PERSONA_EMOJI = {
  'FIRE STARTER': '🔥', 'ROAD WARRIOR': '🚗', 'SKY NOMAD': '✈️', 'MEAT MACHINE': '🍖',
  'CONCRETE KING': '🏠', 'RETAIL ROCKSTAR': '🛍', 'DIGITAL DRAGON': '📱', 'PROMPT NINJA': '🤖',
  'SMOKE FARMER': '🌾', 'BUFFALO BOSS': '🦬', 'PLASTIC PIRATE': '📦', 'FIELD FLAMER': '🌾',
  'WALKING LEGEND': '🚶', 'PEDAL HERO': '🚲', 'HYDRO HERO': '⚡', 'LOCAL LEGEND': '🌿',
  'CIRCULAR CHAMPION': '♻', 'PLANT PIONEER': '🌱', 'COZY MINIMALIST': '🏡', 'THRIFT NINJA': '🛍',
  'BIOGAS BOSS': '🫧', 'PLANET PAL': '🦋',
  // Generic per-category fallback personas (CATEGORY_FALLBACK in reportModel)
  'KITCHEN FURNACE': '🍳', 'ENERGY BARON': '💡', 'SMOKE SIGNAL': '🔥', 'MILE MASTER': '🛣',
  'FEAST BARON': '🍽', 'CART COMMANDER': '🛒', 'WASTE WRANGLER': '🗑', 'SCREEN SOVEREIGN': '💻',
};
const IDENTITY_EMOJI = {
  'CLIMATE GUARDIAN': '🌍', 'CLIMATE STEWARD': '🌱', 'CLIMATE CHALLENGER': '🌿',
  'CLIMATE CATALYST': '🔥', 'CLIMATE LEADER IN TRANSITION': '⭐',
};
const IDENTITY_COLOR = {
  'CLIMATE GUARDIAN': '#8A9A5B', 'CLIMATE STEWARD': '#7A9D34', 'CLIMATE CHALLENGER': '#4A90E2',
  'CLIMATE CATALYST': '#F5A623', 'CLIMATE LEADER IN TRANSITION': '#D0021B',
};
const EFFORT = { 1: 'EASY', 2: 'MEDIUM', 3: 'HARD', 4: 'HARD', 5: 'HARD' };

export default function DetailedReport({ total, parts, userName, userLoc, answers }) {
  const [pledged, setPledged] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);

  const fallbackName = userName || "Traveler";
  // Single source of truth — identical to the PDF report & certificate.
  const m = buildReportModel({
    name: userName,
    total_emissions: parseFloat(total || 0),
    answers_data: answers && Object.keys(answers).length ? answers : undefined,
    breakdown_home: parts?.home,
    breakdown_transport: parts?.transport,
    breakdown_food: parts?.food,
    breakdown_goods: parts?.goods,
  });

  const totalRaw = m.totalRaw;
  const totalFmt = m.totalFmt;

  const idy = {
    title: `${IDENTITY_EMOJI[m.idy.title] || ''} ${m.idy.title}`.trim(),
    color: IDENTITY_COLOR[m.idy.title] || '#7A9D34',
    desc: m.idy.desc,
  };

  const primaryP = { ...m.primaryP, id: PERSONA_EMOJI[m.primaryP.title] || '🌍' };
  const secondaryP = { ...m.secondaryP, id: PERSONA_EMOJI[m.secondaryP.title] || '🦋' };

  const num = (x) => { const n = parseFloat(x); return Number.isFinite(n) ? n : 0; };
  const D = m.breakdown;
  const cooking = num(D.cooking), homeEnergy = num(D.homeEnergy), agBurning = num(D.agBurning);
  const transport = num(D.transport), food = num(D.food), shopping = num(D.shopping);
  const waste = num(D.waste), digital = num(D.digital);

  // Exact, impact-ranked actions from the model (carbon-removal offset pinned last),
  // mapped to this component's effort labels.
  const actions = m.actions.map((a) => ({ title: a.title, desc: a.desc, red: a.red, diff: EFFORT[a.diff] || 'MEDIUM' }));

  const cats = [
    { id: 'cooking', name: 'Cooking', val: cooking, color: 'var(--saffron, #F5A623)', details: 'Cooking fuel — firewood, LPG, biogas or electric induction.' },
    { id: 'home', name: 'Home & Energy', val: homeEnergy, color: 'var(--coral, #D85A30)', details: 'Housing material, winter heating, and household electricity.' },
    { id: 'agburning', name: 'Agricultural Burning', val: agBurning, color: 'var(--teal, #9AB729)', details: 'Burning crop residue near the home.' },
    { id: 'transport', name: 'Transport', val: transport, color: 'var(--sky, #4A90E2)', details: 'Daily commute, private vehicles, and flights.' },
    { id: 'food', name: 'Food', val: food, color: 'var(--saffron, #F5A623)', details: 'Diet type, food waste, rice paddies, and livestock.' },
    { id: 'goods', name: 'Consumption', val: shopping, color: 'var(--teal, #9AB729)', details: 'Clothing, electronics, and single-use plastics.' },
    { id: 'waste', name: 'Waste & Water', val: waste, color: 'var(--ink, #3E2723)', details: 'Solid waste disposal, sanitation, and water heating.' },
    { id: 'digital', name: 'Digital', val: digital, color: 'var(--sky, #4A90E2)', details: 'Streaming, AI use, devices, and mobile data.' }
  ].sort((a, b) => b.val - a.val);

  const calcTotal = Math.max(totalRaw, 0.001);

  return (
    <div className={styles.reportContainer}>
      
      {/* SECTION 1: HERO */}
      <div>
        <div className={styles.sectionTitle}>Section 01 / Your Climate Identity</div>
        <div className={styles.heroCard} style={{ borderColor: idy.color }}>
          <div className={styles.heroIdentity} style={{ color: idy.color }}>{idy.title}</div>
          <div className={styles.heroDesc}>{idy.desc}</div>
          <div className={styles.heroTotal}>{totalFmt} <span>tCO2e/year</span></div>
          
          <div className={styles.metricsRow}>
            <div className={styles.metricBox}>
              <div className={styles.metricVal}>0.6 t</div>
              <div className={styles.metricLabel}>🇳🇵 Nepal Avg</div>
            </div>
            <div className={styles.metricBox}>
              <div className={styles.metricVal} style={{ color: 'var(--teal)' }}>2.5 t</div>
              <div className={styles.metricLabel} style={{ color: 'var(--teal)', fontWeight: 600 }}>🎯 1.5°C Budget</div>
            </div>
            <div className={styles.metricBox}>
              <div className={styles.metricVal}>4.7 t</div>
              <div className={styles.metricLabel}>🌍 Global Avg</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: BUDGET EXPLANATION */}
      <div>
        <div className={styles.sectionTitle}>Section 04 / Climate Budget Explanation</div>
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>Why 2.5 tonnes?</div>
          <div className={styles.infoText}>
            Climate scientists estimate that to keep global warming close to 1.5°C, every person should aim to stay within approximately 2.5 tonnes of CO2e per year. This number comes from dividing the remaining global carbon budget equally among everyone on Earth. It is a target, not an average.
          </div>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>🇳🇵 Nepal Avg</div>
            <div className={styles.compBar}><div className={styles.compFill} style={{ width: `${(0.6/14)*100}%`, background: 'var(--ink-mute)' }}></div></div>
            <div className={styles.compVal}>0.6 t</div>
          </div>
          <div className={styles.compRow}>
            <div className={styles.compLabel} style={{ color: 'var(--teal)' }}>🎯 1.5°C Budget</div>
            <div className={styles.compBar}><div className={styles.compFill} style={{ width: `${(2.5/14)*100}%`, background: 'var(--teal)' }}></div></div>
            <div className={styles.compVal} style={{ color: 'var(--teal)' }}>2.5 t</div>
          </div>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>🌍 Global Avg</div>
            <div className={styles.compBar}><div className={styles.compFill} style={{ width: `${(4.7/14)*100}%`, background: 'var(--ink-mute)' }}></div></div>
            <div className={styles.compVal}>4.7 t</div>
          </div>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>🇺🇸 USA Avg</div>
            <div className={styles.compBar}><div className={styles.compFill} style={{ width: `${(14/14)*100}%`, background: 'var(--coral, #D85A30)' }}></div></div>
            <div className={styles.compVal}>14.0 t</div>
          </div>
        </div>
      </div>

      {/* SECTION 5: CLIMATE DNA */}
      <div>
        <div className={styles.sectionTitle}>Section 05 / Your Climate DNA</div>
        <div className={styles.dnaGrid}>
          <div className={styles.dnaCard}>
            <div className={styles.dnaTag}>Primary Persona</div>
            <div className={styles.dnaEmoji}>{primaryP.id}</div>
            <div className={styles.dnaTitle}>{primaryP.title}</div>
            <div className={styles.dnaProp}>
              <div className={styles.dnaLabel}>Climate Habit</div>
              <div className={styles.dnaText}>"{primaryP.habit}"</div>
            </div>
            <div className={styles.dnaProp}>
              <div className={styles.dnaLabel}>Mission</div>
              <div className={styles.dnaText}>{primaryP.mission}</div>
            </div>
            <div className={styles.dnaProp} style={{ marginBottom: 0 }}>
              <div className={styles.dnaLabel}>Fun Fact</div>
              <div className={styles.dnaText}>{primaryP.fact}</div>
            </div>
          </div>
          <div className={styles.dnaCard}>
            <div className={styles.dnaTag} style={{ color: 'var(--ink-soft)' }}>Secondary Persona</div>
            <div className={styles.dnaEmoji}>{secondaryP.id}</div>
            <div className={styles.dnaTitle}>{secondaryP.title}</div>
            <div className={styles.dnaProp}>
              <div className={styles.dnaLabel}>Climate Superpower</div>
              <div className={styles.dnaText}>{secondaryP.superpower}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: CARBON BREAKDOWN */}
      <div>
        <div className={styles.sectionTitle}>Section 06 / Carbon Breakdown</div>
        <div className={styles.infoText} style={{ marginBottom: 16 }}>Click any category to expand details.</div>
        <div>
          {cats.map(c => {
            const pct = Math.round((c.val / calcTotal) * 100);
            if (pct <= 0) return null;
            const isExpanded = expandedCat === c.id;
            
            return (
              <div key={c.id} className={styles.breakdownItem} onClick={() => setExpandedCat(isExpanded ? null : c.id)}>
                <div className={styles.breakdownHeader}>
                  <div className={styles.breakdownName}>{c.name}</div>
                  <div className={styles.breakdownBar}>
                    <div className={styles.breakdownFill} style={{ width: `${pct}%`, background: c.color }}></div>
                  </div>
                  <div className={styles.breakdownVal}>{pct}%</div>
                </div>
                {isExpanded && (
                  <div className={styles.breakdownDetails}>
                    <strong>Annual emissions:</strong> {(c.val * 1000).toFixed(0)} kg CO2e.<br/>
                    {c.details}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: TOP ACTIONS */}
      <div>
        <div className={styles.sectionTitle}>Section 07 / Top Climate Actions</div>
        <div className={styles.actionList}>
          {actions.map((a, i) => (
            <div key={i} className={styles.actionItem}>
              <div className={styles.actionRank}>#{i + 1}</div>
              <div className={styles.actionContent}>
                <div className={styles.actionTitle}>{a.title}</div>
                <div className={styles.actionDesc}>{a.desc}</div>
                <div className={styles.actionMeta}>
                  <span>Reduction: <span className={styles.actionRed}>{a.red}</span></span>
                  <span>Effort: <span>{a.diff}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8: ROADMAP */}
      <div>
        <div className={styles.sectionTitle}>Section 08 / Climate Roadmap</div>
        <div className={styles.roadmapContainer}>
          <div className={styles.roadNode}>
            <div className={styles.roadDot}></div>
            <div className={styles.roadLine}></div>
            <div className={styles.roadContent}>
              <div className={styles.roadVal}>{totalFmt} tCO2e</div>
              <div className={styles.roadLabel}>Current Footprint</div>
            </div>
          </div>
          {actions.map((a, i) => (
            <div key={i} className={styles.roadNode}>
              <div className={styles.roadDot} style={{ background: 'var(--ink-mute)' }}></div>
              <div className={styles.roadLine}></div>
              <div className={styles.roadContent}>
                <div className={styles.roadVal} style={{ fontSize: 13, color: 'var(--ink)' }}>↓ {a.title}</div>
              </div>
            </div>
          ))}
          <div className={styles.roadNode}>
            <div className={styles.roadDot} className={styles.roadDotEnd}></div>
            <div className={styles.roadLine}></div>
            <div className={styles.roadContent}>
              <div className={styles.roadVal} className={styles.roadValPrimary}>Net Zero</div>
              <div className={styles.roadLabel}>Long Term Goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 9: PLEDGE */}
      <div>
        <div className={styles.sectionTitle}>Section 09 / Climate Pledge</div>
        <div className={styles.pledgeSection}>
          <div className={styles.pledgeText}>
            "I understand that every journey, meal, purchase and conversation has an impact on our planet.<br/><br/>
            I pledge to measure my footprint, reduce it where possible, inspire others through my actions and become part of the solution.<br/><br/>
            Climate action is not perfection. It is progress."
          </div>
          <div className={styles.pledgeBox} onClick={() => setPledged(!pledged)}>
            <div className={`${styles.checkbox} ${pledged ? styles.checked : ''}`}>
              <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div className={styles.pledgeBoxLabel}>I take this pledge.</div>
          </div>
          {pledged && (
            <div>
              <div className={styles.signatureLine}>
                <span className={styles.signName}>{fallbackName}</span>
              </div>
              <div className={styles.signSub}>Digital Signature</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
