"use client";
import React, { useState } from 'react';
import styles from './ResultsStoryWalkthrough.module.css';

export default function ResultsStoryWalkthrough({ total, onComplete }) {
  const [slide, setSlide] = useState(0);
  const [animate, setAnimate] = useState(true);

  const bottles = Math.round(total * 125000);
  const phones = Math.round(total * 120000);
  const kms = Math.round(total * 4023);

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
      id: 'cola',
      visual: (
        <div className={styles.bottleVisual}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 80" className={styles.bottle} style={{ animationDelay: `${i * 0.15}s` }}>
              <rect x="8" y="0" width="8" height="8" rx="2" fill="var(--coral, #D85A30)" opacity="0.5" />
              <path d="M 7 8 Q 4 20 4 30 L 4 72 Q 4 78 8 78 L 16 78 Q 20 78 20 72 L 20 30 Q 20 20 17 8 Z" fill="none" stroke="var(--coral, #D85A30)" strokeWidth="1" opacity="0.4" />
              <path d="M 7 8 Q 4 20 4 30 L 4 72 Q 4 78 8 78 L 16 78 Q 20 78 20 72 L 20 30 Q 20 20 17 8 Z" fill="var(--coral, #D85A30)" opacity="0.08" />
            </svg>
          ))}
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">That is equivalent to producing</span>
            <span className="lang-np">यो उत्पादन गरे बराबर हो</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{bottles.toLocaleString()}</span>
            <span className="lang-np">{toNp(bottles.toLocaleString())}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">one‑litre bottles of Coca‑Cola</span>
            <span className="lang-np">एक-लिटर कोका-कोलाको बोतलहरू</span>
          </p>
        </>
      )
    },
    {
      id: 'phones',
      visual: (
        <div className={styles.phoneVisual}>
          {Array.from({ length: 4 }).map((_, i) => (
            <svg key={i} viewBox="0 0 40 70" className={styles.phone} style={{ animationDelay: `${i * 0.2}s` }}>
              <rect x="2" y="2" width="36" height="66" rx="6" fill="none" stroke="var(--sky, #378ADD)" strokeWidth="1.5" opacity="0.4" />
              <rect x="6" y="8" width="28" height="48" rx="2" fill="var(--sky, #378ADD)" opacity="0.06" />
              <circle cx="20" cy="62" r="2.5" fill="none" stroke="var(--sky, #378ADD)" strokeWidth="1" opacity="0.3" />
              <path d="M 22 22 L 17 34 L 21 34 L 18 46" fill="none" stroke="var(--saffron, #BA7517)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.chargeBolt} />
            </svg>
          ))}
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">Or the energy needed to fully charge</span>
            <span className="lang-np">वा पूर्ण चार्ज गर्न चाहिने ऊर्जा</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{phones.toLocaleString()}</span>
            <span className="lang-np">{toNp(phones.toLocaleString())}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">smartphones from zero to one hundred</span>
            <span className="lang-np">स्मार्टफोनहरू शून्यदेखि सय प्रतिशतसम्म</span>
          </p>
        </>
      )
    },
    {
      id: 'car',
      visual: (
        <div className={styles.carVisual}>
          <div className={styles.horizon} />
          <svg viewBox="0 0 300 40" className={styles.roadSvg}>
            <line x1="0" y1="20" x2="300" y2="20" stroke="var(--ink-mute, #8A8678)" strokeWidth="1" opacity="0.2" />
            <g className={styles.dashGroup}>
              {Array.from({ length: 15 }).map((_, i) => (
                <rect key={i} x={i * 22} y="18" width="12" height="4" rx="1" fill="var(--ink-mute, #8A8678)" opacity="0.25" />
              ))}
            </g>
          </svg>
          <svg viewBox="0 0 80 40" className={styles.carIcon}>
            <path d="M 10 28 L 15 15 Q 20 8 30 8 L 50 8 Q 60 8 65 15 L 70 28 Z" fill="none" stroke="var(--ink-soft, #5A574F)" strokeWidth="1.5" opacity="0.5" />
            <circle cx="22" cy="30" r="5" fill="none" stroke="var(--ink-soft, #5A574F)" strokeWidth="1.5" opacity="0.4" />
            <circle cx="58" cy="30" r="5" fill="none" stroke="var(--ink-soft, #5A574F)" strokeWidth="1.5" opacity="0.4" />
            <line x1="30" y1="8" x2="28" y2="18" stroke="var(--ink-mute, #8A8678)" strokeWidth="1" opacity="0.3" />
            <line x1="50" y1="8" x2="52" y2="18" stroke="var(--ink-mute, #8A8678)" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>
      ),
      content: (
        <>
          <p className={styles.eyebrow}>
            <span className="lang-en">Which is like driving a petrol car for</span>
            <span className="lang-np">जुन पेट्रोल कार चलाए जस्तै हो</span>
          </p>
          <h2 className={styles.heroNumber}>
            <span className="lang-en">{kms.toLocaleString()}</span>
            <span className="lang-np">{toNp(kms.toLocaleString())}</span>
          </h2>
          <p className={styles.heroUnit}>
            <span className="lang-en">kilometres without stopping</span>
            <span className="lang-np">किलोमिटर बिना रोकीकन</span>
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
