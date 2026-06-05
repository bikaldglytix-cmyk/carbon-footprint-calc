"use client";
import styles from './CalculatorForm.module.css';

// SVG Icons
const Icons = {
  firewood: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19 L19 5 M9 19 L19 9 M5 15 L15 5"/><path d="M3 21 L21 21"/></svg>,
  lpg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="4" width="8" height="16" rx="2"/><path d="M10 4 V2 H14 V4"/><circle cx="12" cy="12" r="1.5"/></svg>,
  biogas: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 C 8 9 6 12 6 15 a6 6 0 0 0 12 0 C 18 12 16 9 12 3 Z"/><path d="M12 14 v3"/></svg>,
  induction: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="9" cy="12" r="2.4"/><circle cx="16" cy="12" r="1.6"/></svg>,
  walk: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="1.6"/><path d="M11 21 L13 14 L9 11 L11 7 L14 9 L17 10"/><path d="M13 14 L16 18 L18 21"/></svg>,
  cycle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17 L11 9 L14 9 L18 17 M11 9 L8 9"/></svg>,
  bus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="12" rx="2"/><path d="M4 13 H20"/><circle cx="8" cy="19" r="1.4"/><circle cx="16" cy="19" r="1.4"/></svg>,
  safa: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16 V9 a2 2 0 0 1 2-2 H16 l3 3 V16"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/><path d="M14 11 l1.5 -2 M16 11 h2"/></svg>,
  tempo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16 V10 a2 2 0 0 1 2-2 H14 l4 4 V16"/><circle cx="7" cy="17" r="1.4"/><circle cx="15" cy="17" r="1.4"/></svg>,
  micro: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="11" rx="2"/><path d="M3 12 H21"/><path d="M7 9 H10 M14 9 H17"/><circle cx="7" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg>,
  bike: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17 L10 11 L13 11 L16 7 L19 7 M13 11 L17 14"/></svg>,
  car: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16 V12 L5 8 H19 L21 12 V16"/><path d="M3 16 H21"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/></svg>
};

export default function CalculatorForm({ state, setState, openResults }) {
  const handleChange = (key, val) => {
    setState(prev => ({ ...prev, [key]: val }));
  };

  const SegmentedControl = ({ valueKey, options }) => (
    <div className={styles.segmented} role="radiogroup">
      {options.map(opt => (
        <button key={opt.val} className={state[valueKey] === opt.val ? styles.active : ''} onClick={() => handleChange(valueKey, opt.val)}>
          {opt.icon && <span className={styles.ico}>{Icons[opt.icon]}</span>}
          <span className="lang-en">{opt.labelEn}</span>
          <span className="lang-np">{opt.labelNp}</span>
        </button>
      ))}
    </div>
  );

  const Slider = ({ valueKey, min, max, step, labelEn, labelNp, unit, scaleText }) => {
    const v = state[valueKey];
    const p = (v - min) / (max - min);
    return (
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          <span className={styles.label}>
            <span className="lang-en">{labelEn}</span>
            <span className="lang-np">{labelNp}</span>
          </span>
          <span className={styles.value}><span>{v}</span> {unit}</span>
        </div>
        <div className={styles.sliderRow}>
          <input type="range" min={min} max={max} step={step} value={v} onChange={e => handleChange(valueKey, parseFloat(e.target.value))} />
          <div className={styles.track}><div className={styles.fill} style={{ width: `${p * 100}%` }}></div></div>
          <div className={styles.scale}>
            <span><span className="lang-en">{scaleText[0].en}</span><span className="lang-np">{scaleText[0].np}</span></span>
            <span><span className="lang-en">{scaleText[1].en}</span><span className="lang-np">{scaleText[1].np}</span></span>
          </div>
        </div>
      </div>
    );
  };

  const Stepper = ({ valueKey, min, max, step, labelEn, labelNp, hintEn, hintNp }) => {
    const v = state[valueKey];
    return (
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          <span className={styles.label}>
            <span className="lang-en">{labelEn}</span>
            <span className="lang-np">{labelNp}</span>
          </span>
          <span className={styles.value}><span>{v}</span></span>
        </div>
        <div className={styles.stepperRow}>
          <div className={styles.stepper}>
            <button onClick={() => handleChange(valueKey, Math.max(min, v - step))}>−</button>
            <span className={styles.count}>{v}</span>
            <button onClick={() => handleChange(valueKey, Math.min(max, v + step))}>+</button>
          </div>
          <span className={styles.hint}>
            <span className="lang-en">{hintEn}</span>
            <span className="lang-np">{hintNp}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <main className={styles.formMain}>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>i.</span>
          <h2 className={styles.sectionTitle}>
            <span className="lang-en">Home &amp; energy</span>
            <span className="lang-np">घर र ऊर्जा</span>
          </h2>
        </div>
        <p className={styles.sectionSub}>
          <span className="lang-en">Cooking, light, warmth.</span>
          <span className="lang-np">पकाउने, बिजुली, न्यानो।</span>
        </p>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            <span className={styles.label}>
              <span className="lang-en">Cooking method</span>
              <span className="lang-np">पकाउने तरिका</span>
            </span>
          </div>
          <SegmentedControl valueKey="cookMethod" options={[
            { val: 'firewood', icon: 'firewood', labelEn: 'Firewood', labelNp: 'दाउरा' },
            { val: 'lpg', icon: 'lpg', labelEn: 'LPG', labelNp: 'एलपीजी' },
            { val: 'biogas', icon: 'biogas', labelEn: 'Biogas', labelNp: 'बायोग्यास' },
            { val: 'induction', icon: 'induction', labelEn: 'Induction', labelNp: 'इन्डक्शन' }
          ]} />
        </div>

        <Stepper valueKey="lpg" min={0} max={6} step={0.5} 
          labelEn={<>LPG cylinders <span className={styles.subtle}>/ month (14.2 kg)</span></>}
          labelNp={<>एलपीजी सिलिन्डर <span className={styles.subtle}>/ महिना (१४.२ केजी)</span></>}
          hintEn="a family of four uses ~1–2" hintNp="४ जनाको परिवारमा करिब १–२" />

        <Slider valueKey="elec" min={0} max={600} step={10} unit="kWh"
          labelEn={<>Electricity use <span className={styles.subtle}>/ month</span></>}
          labelNp={<>बिजुली खपत <span className={styles.subtle}>/ महिना</span></>}
          scaleText={[{en: 'Lights only', np: 'केवल बिजुली बत्ती'}, {en: 'Everything on', np: 'सबै उपकरण'}]} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>ii.</span>
          <h2 className={styles.sectionTitle}>
            <span className="lang-en">Getting around</span>
            <span className="lang-np">यातायात</span>
          </h2>
        </div>
        <p className={styles.sectionSub}>
          <span className="lang-en">From the gallis of Kathmandu to flights east.</span>
          <span className="lang-np">काठमाडौँको गल्लीदेखि उडानसम्म।</span>
        </p>

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            <span className={styles.label}>
              <span className="lang-en">Your main way to move</span>
              <span className="lang-np">तपाईंको मुख्य साधन</span>
            </span>
          </div>
          <SegmentedControl valueKey="mode" options={[
            { val: 'walk', icon: 'walk', labelEn: 'Walk', labelNp: 'हिँड्ने' },
            { val: 'cycle', icon: 'cycle', labelEn: 'Bicycle', labelNp: 'साइकल' },
            { val: 'bus', icon: 'bus', labelEn: 'Bus', labelNp: 'बस' },
            { val: 'safa', icon: 'safa', labelEn: 'Safa Tempo', labelNp: 'सफा टेम्पो' },
            { val: 'tempo', icon: 'tempo', labelEn: 'Tempo', labelNp: 'टेम्पो' },
            { val: 'micro', icon: 'micro', labelEn: 'Microbus', labelNp: 'माइक्रोबस' },
            { val: 'bike', icon: 'bike', labelEn: 'Motorbike', labelNp: 'मोटरसाइकल' },
            { val: 'car', icon: 'car', labelEn: 'Car', labelNp: 'कार' }
          ]} />
        </div>

        <Slider valueKey="distance" min={0} max={400} step={5} unit="km"
          labelEn="Distance each week" labelNp="साप्ताहिक दूरी"
          scaleText={[{en: 'Local only', np: 'केवल नजिकै'}, {en: 'Across the valley', np: 'उपत्यका पार'}]} />

        <Stepper valueKey="domflight" min={0} max={40} step={1} 
          labelEn={<>Domestic flights <span className={styles.subtle}>/ year</span></>}
          labelNp={<>स्वदेशी उडान <span className={styles.subtle}>/ वार्षिक</span></>}
          hintEn="KTM–Pokhara, Lukla…" hintNp="काठमाडौँ–पोखरा, लुक्ला…" />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>iii.</span>
          <h2 className={styles.sectionTitle}>
            <span className="lang-en">What you eat</span>
            <span className="lang-np">खाना</span>
          </h2>
        </div>
        <p className={styles.sectionSub}>
          <span className="lang-en">Dal bhat, festival feasts, and everything between.</span>
          <span className="lang-np">दालभात, चाडपर्व, र बीचमा सबै।</span>
        </p>

        <Slider valueKey="dalbhat" min={0} max={14} step={1} unit="×"
          labelEn={<>Dal bhat <span className={styles.subtle}>/ week</span></>}
          labelNp={<>दालभात <span className={styles.subtle}>/ हप्ता</span></>}
          scaleText={[{en: '0', np: '०'}, {en: '14', np: '१४'}]} />

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            <span className={styles.label}>
              <span className="lang-en">How often is there meat?</span>
              <span className="lang-np">मासु कति पटक खानुहुन्छ?</span>
            </span>
          </div>
          <SegmentedControl valueKey="meat" options={[
            { val: 'never', labelEn: 'Never', labelNp: 'कहिल्यै छैन' },
            { val: 'rare', labelEn: 'Few / month', labelNp: 'महिनामा थोरै' },
            { val: 'weekly', labelEn: 'Weekly', labelNp: 'साप्ताहिक' },
            { val: 'daily', labelEn: 'Most days', labelNp: 'प्रायः' }
          ]} />
        </div>

        <Slider valueKey="local" min={0} max={100} step={5} unit="% local"
          labelEn="Local or imported produce?" labelNp="स्थानीय वा आयातित?"
          scaleText={[{en: 'All imported', np: 'सबै आयात'}, {en: 'All local', np: 'सबै स्थानीय'}]} />

        <Stepper valueKey="feast" min={0} max={30} step={1} 
          labelEn={<>Festival feasts <span className={styles.subtle}>/ year</span></>}
          labelNp={<>चाडपर्वका भोज <span className={styles.subtle}>/ वार्षिक</span></>}
          hintEn="Dashain, Tihar, Tij…" hintNp="दशैँ, तिहार, तीज…" />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionNum}>iv.</span>
          <h2 className={styles.sectionTitle}>
            <span className="lang-en">Things &amp; far places</span>
            <span className="lang-np">सामान र टाढा</span>
          </h2>
        </div>
        <p className={styles.sectionSub}>
          <span className="lang-en">What comes home with you, and how far you go.</span>
          <span className="lang-np">घर ल्याएको सामान, र तपाईं कहाँसम्म पुग्नुहुन्छ।</span>
        </p>

        <Stepper valueKey="intflight" min={0} max={20} step={1} 
          labelEn={<>International flights <span className={styles.subtle}>/ year</span></>}
          labelNp={<>अन्तर्राष्ट्रिय उडान <span className={styles.subtle}>/ वार्षिक</span></>}
          hintEn="Delhi, Dubai, beyond…" hintNp="दिल्ली, दुबई, टाढा…" />

        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            <span className={styles.label}>
              <span className="lang-en">New things you buy</span>
              <span className="lang-np">किनमेलको बानी</span>
            </span>
          </div>
          <SegmentedControl valueKey="shopping" options={[
            { val: 'minimal', labelEn: 'Minimal', labelNp: 'थोरै' },
            { val: 'modest', labelEn: 'Modest', labelNp: 'सामान्य' },
            { val: 'regular', labelEn: 'Regular', labelNp: 'नियमित' },
            { val: 'frequent', labelEn: 'Frequent', labelNp: 'धेरै' }
          ]} />
        </div>
      </section>

      <div className={styles.ctaRow}>
        <button className={styles.cta} onClick={openResults}>
          <span className="lang-en">See your footprint</span>
          <span className="lang-np">आफ्नो फुटप्रिन्ट हेर्नुहोस्</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12 H19 M13 6 L19 12 L13 18"/></svg>
        </button>
      </div>
    </main>
  );
}
