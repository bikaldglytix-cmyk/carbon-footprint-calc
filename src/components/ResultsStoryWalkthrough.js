"use client";
import React, { useState } from 'react';
import styles from './ResultsStoryWalkthrough.module.css';

export default function ResultsStoryWalkthrough({ total, onComplete }) {
  const [slide, setSlide] = useState(0);
  const [animate, setAnimate] = useState(true);

  const budget = 2.3;
  const difference = Math.abs(total - budget);
  const earths = (total / budget).toFixed(1);

  const toNp = (numStr) => {
    const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९', ',': ',' };
    return String(numStr).replace(/[0-9]/g, m => map[m]);
  };

  const handleNext = () => {
    if (slide < 4) {
      setAnimate(false);
      setTimeout(() => {
        setSlide(slide + 1);
        setAnimate(true);
      }, 50);
    } else {
      onComplete();
    }
  };

  const slides = [
    {
      id: 'reveal',
      visual: (
        <div className={styles.revealVisual}>
          <svg viewBox="0 0 200 200" className={styles.revealRing}>
            <defs>
              <radialGradient id="atmoGlow" cx="50%" cy="50%" r="50%">
                <stop offset="85%" stopColor="transparent" />
                <stop offset="100%" stopColor="var(--sky, #378ADD)" stopOpacity="0.15" />
              </radialGradient>
              <clipPath id="globeClip">
                <circle cx="100" cy="100" r="72" />
              </clipPath>
            </defs>

            {/* Outer rings (re-added as requested by layout) */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1" opacity="0.3" />
            <circle cx="100" cy="100" r="95" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="0.5" opacity="0.15" className={styles.orbitRing} />

            {/* Ocean base */}
            <circle cx="100" cy="100" r="72" fill="var(--sky, #378ADD)" opacity="0.1" />

            {/* Continents */}
            <g clipPath="url(#globeClip)">
              {/* Africa & Europe */}
              <path d="M 95 55 Q 90 60 88 68 Q 85 75 87 82 Q 90 90 85 100 Q 82 108 85 118 Q 88 125 92 130 Q 96 128 98 120 Q 100 112 105 108 Q 108 100 105 92 Q 102 85 100 78 Q 98 70 100 62 Q 98 56 95 55 Z" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1.5" opacity="0.6" />
              {/* South America */}
              <path d="M 62 100 Q 58 108 60 118 Q 62 128 58 138 Q 56 145 60 148 Q 64 150 66 145 Q 68 138 72 132 Q 75 125 73 118 Q 70 110 65 102 Z" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1.5" opacity="0.6" />
              {/* North America */}
              <path d="M 48 55 Q 42 60 38 68 Q 35 75 40 78 Q 48 82 55 80 Q 62 78 68 72 Q 72 68 70 62 Q 66 56 60 52 Q 54 50 48 55 Z" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1.5" opacity="0.6" />
              {/* Asia */}
              <path d="M 108 48 Q 115 52 125 55 Q 135 58 142 62 Q 148 68 150 75 Q 148 82 142 85 Q 135 88 128 82 Q 120 78 115 72 Q 110 65 108 58 Q 106 52 108 48 Z" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1.5" opacity="0.6" />
              {/* Australia */}
              <path d="M 135 115 Q 140 118 148 122 Q 152 128 150 132 Q 145 136 138 134 Q 132 130 130 125 Q 132 118 135 115 Z" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1.5" opacity="0.6" />
              {/* Ice caps */}
              <ellipse cx="100" cy="32" rx="30" ry="8" fill="var(--ink-mute, #8A8678)" opacity="0.2" />
              <ellipse cx="100" cy="168" rx="25" ry="7" fill="var(--ink-mute, #8A8678)" opacity="0.2" />
            </g>

            {/* Atmosphere gradient overlay */}
            <circle cx="100" cy="100" r="72" fill="url(#atmoGlow)" />
            <circle cx="100" cy="100" r="72" fill="none" stroke="var(--sky, #378ADD)" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">Your Estimated Annual Carbon Footprint</span>
            <span className="lang-np">तपाईंको अनुमानित वार्षिक कार्बन फुटप्रिन्ट</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{total.toFixed(2)}</span>
            <span className="lang-np">{toNp(total.toFixed(2))}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">tonnes of CO₂ equivalent</span>
            <span className="lang-np">टन CO₂ बराबर</span>
          </p>
        </>
      )
    },
    {
      id: 'budget',
      visual: (
        <div className={styles.budgetVisual} style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '120px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: `${Math.min(100, (budget / Math.max(total, budget)) * 100)}px`, background: 'var(--teal, #9AB729)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--ink-mute)' }}>Budget</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: `${Math.min(100, (total / Math.max(total, budget)) * 100)}px`, background: 'var(--coral, #D85A30)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--ink-mute)' }}>You</span>
          </div>
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">The sustainable climate budget is {budget.toFixed(1)} tonnes.</span>
            <span className="lang-np">दिगो जलवायु बजेट {toNp(budget.toFixed(1))} टन हो।</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{total.toFixed(2)}</span>
            <span className="lang-np">{toNp(total.toFixed(2))}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">tonnes is what you emitted</span>
            <span className="lang-np">टन तपाईंले उत्सर्जन गर्नुभयो</span>
          </p>
        </>
      )
    },
    {
      id: 'difference',
      visual: (
        <div className={styles.diffVisual} style={{ height: '120px', display: 'flex', alignItems: 'center' }}>
          <svg viewBox="0 0 100 100" width="100" height="100" style={{ animation: 'gentleDrift 3s ease-in-out infinite alternate' }}>
             {total > budget ? (
                <path d="M50 20 L80 50 L60 50 L60 80 L40 80 L40 50 L20 50 Z" fill="var(--coral, #D85A30)" opacity="0.8"/>
             ) : (
                <path d="M50 80 L20 50 L40 50 L40 20 L60 20 L60 50 L80 50 Z" fill="var(--teal, #9AB729)" opacity="0.8"/>
             )}
          </svg>
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">This is</span>
            <span className="lang-np">यो हो</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{difference.toFixed(2)}</span>
            <span className="lang-np">{toNp(difference.toFixed(2))}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">tonnes {total > budget ? 'higher' : 'lower'} than the budget</span>
            <span className="lang-np">टन बजेट भन्दा {total > budget ? 'बढी' : 'कम'}</span>
          </p>
        </>
      )
    },
    {
      id: 'earths',
      visual: (
        <div className={styles.earthVisual} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '200px' }}>
          {Array.from({ length: Math.min(10, Math.ceil(earths)) }).map((_, i) => (
             <svg key={i} viewBox="0 0 100 100" width="40" height="40" style={{ animation: `riseIn 0.5s ease forwards`, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
               <circle cx="50" cy="50" r="45" fill="var(--sky, #378ADD)" opacity="0.2"/>
               <circle cx="50" cy="50" r="45" fill="none" stroke="var(--sky, #378ADD)" strokeWidth="4"/>
               <path d="M 45 20 Q 30 40 40 60 Q 60 70 70 50 Q 80 20 45 20 Z" fill="var(--teal, #9AB729)" opacity="0.6"/>
             </svg>
          ))}
          {earths > 10 && <span style={{ alignSelf: 'center', fontWeight: 'bold', color: 'var(--ink-mute)', marginLeft: '8px' }}>+</span>}
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">We would need</span>
            <span className="lang-np">हामीलाई आवश्यक पर्नेछ</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{earths}</span>
            <span className="lang-np">{toNp(earths)}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">Earths if everyone lived like you</span>
            <span className="lang-np">पृथ्वीहरू यदि सबैले तपाईं जस्तै जीवन बिताए भने</span>
          </p>
        </>
      )
    },
    {
      id: 'action',
      visual: (
        <div className={styles.actionVisual}>
          <svg viewBox="0 0 100 100" className={styles.leafSvg}>
            <path d="M 50 90 Q 50 50 30 30 Q 50 10 70 30 Q 50 50 50 90 Z" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1.5" opacity="0.5" />
            <path d="M 50 90 L 50 45" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="1" opacity="0.3" />
            <path d="M 50 60 Q 40 55 35 45" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="0.8" opacity="0.2" />
            <path d="M 50 70 Q 60 65 63 55" fill="none" stroke="var(--teal, #9AB729)" strokeWidth="0.8" opacity="0.2" />
          </svg>
        </div>
      ),
      content: (
        <>
          <h2 className={styles.closingTitle}>
            <span className="lang-en">These numbers are not set in stone.</span>
            <span className="lang-np">यी संख्याहरू ढुङ्गामा कोरिएका होइनन्।</span>
          </h2>
          <p className={styles.closingSub}>
            <span className="lang-en">Every choice you make from here reshapes your impact on this planet.</span>
            <span className="lang-np">यहाँबाट तपाईंले गर्ने हरेक छनोटले यो ग्रहमा तपाईंको प्रभाव पुनर्निर्माण गर्छ।</span>
          </p>
          <button className={styles.revealBtn} onClick={onComplete}>
            <span className="lang-en">View My Full Report</span>
            <span className="lang-np">मेरो पूर्ण रिपोर्ट हेर्नुहोस्</span>
          </button>
        </>
      )
    }
  ];

  const current = slides[slide];

  return (
    <div className={styles.overlay}>
      <div className={styles.grain} />

      {animate && (
        <div className={styles.slideContainer} key={slide}>
          <div className={styles.visualLayer}>
            {current.visual}
          </div>
          <div className={styles.textLayer}>
            {current.content}
          </div>

          {slide < 4 && (
            <button className={styles.continueBtn} onClick={handleNext}>
              <span className="lang-en">Continue</span>
              <span className="lang-np">अगाडि बढ्नुहोस्</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${((slide + 1) / slides.length) * 100}%` }} />
      </div>
    </div>
  );
}
