"use client";
import { useState, useEffect } from 'react';
import styles from './IntroSequence.module.css';

const introData = [
  {
    en: "The world is heavy. The average global citizen emits about 4.7 tonnes of CO₂ every year.",
    np: "विश्वव्यापी रूपमा एक औसत नागरिकले हरेक वर्ष करिब ४.७ टन कार्बन उत्सर्जन गर्छ।"
  },
  {
    en: "But here in the Himalayas, we tread lightly. The average Nepali footprint is just 0.5 tonnes.",
    np: "तर हाम्रो देश नेपालमा, एक व्यक्तिको औसत कार्बन फुटप्रिन्ट मात्र ०.५ टन छ।"
  },
  {
    en: "However, climate change impacts us the most. How does your daily life compare? Let's find out.",
    np: "तथापि, जलवायु परिवर्तनको असर हामीलाई नै सबैभन्दा बढी परिरहेको छ। तपाईंको कार्बन फुटप्रिन्ट कति छ त? आउनुहोस्, पत्ता लगाऔं।"
  }
];

export default function IntroSequence({ onComplete }) {
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState('runningIn'); // 'runningIn', 'speaking', 'runningOut'
  const [isHopping, setIsHopping] = useState(false);

  useEffect(() => {
    // Start by running in
    const timer = setTimeout(() => {
      setStage('speaking');
    }, 3000); // Wait for slideFromLeft animation
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (step < introData.length - 1) {
      // Trigger a tiny hop animation on the beaver
      setIsHopping(true);
      setTimeout(() => setIsHopping(false), 500); 
      setStep(prev => prev + 1);
    } else {
      // Finished speaking, time to run out
      setStage('runningOut');
      setTimeout(() => {
        onComplete();
      }, 2500); // Wait for slideToRight animation
    }
  };

  return (
    <div className={styles.introWrapper}>
      <div className={styles.beaverStage}>
        
        {stage === 'speaking' && (
          <div className={styles.speechBubble} key={`bubble-${step}`}>
            <div className={styles.dots}>
              {introData.map((_, i) => (
                <div key={i} className={`${styles.dot} ${i === step ? styles.active : ''}`}></div>
              ))}
            </div>
            
            <h2 className={styles.text}>
              <span className="lang-en">{introData[step].en}</span>
              <span className="lang-np">{introData[step].np}</span>
            </h2>

            <div className={styles.controls}>
              <button className={styles.btnPri} onClick={handleNext}>
                {step < introData.length - 1 ? (
                  <>
                    <span className="lang-en">Next</span>
                    <span className="lang-np">अगाडि</span>
                  </>
                ) : (
                  <>
                    <span className="lang-en">Start Journey</span>
                    <span className="lang-np">यात्रा सुरु गर्नुहोस्</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className={styles.logPlatform}>
          <div className={styles.logDetail}></div>
        </div>

        <div className={`${styles.beaverRunner} ${stage === 'runningIn' ? styles.runIn : ''} ${stage === 'runningOut' ? styles.runOut : ''}`}>
           <img 
             src="/beaver.png" 
             alt="Beaver Mascot" 
             className={`${styles.beaverImg} ${isHopping ? styles.hop : ''}`} 
           />
        </div>

      </div>
    </div>
  );
}
