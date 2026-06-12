"use client";
import { useState, useEffect } from 'react';
import styles from './IntroSequence.module.css';
import { asset } from '../lib/asset';

const introData = [
  {
    en: "The world has a limited Climate Budget.",
    np: "विश्वको जलवायु बजेट सीमित छ।"
  },
  {
    en: "According to IPCC, to keep global warming close to 1.5°C, every person should aim to stay within an annual climate budget of approximately 2.5 tonnes of CO₂e.",
    np: "IPCC का अनुसार ग्लोबल वार्मिङलाई १.५ डिग्री सेल्सियसको नजिक राख्न प्रत्येक व्यक्तिले वार्षिक करिब २.५ टन CO₂e को जलवायु बजेट भित्र रहनुपर्छ।"
  },
  {
    en: "Your Climate Check-up compares your lifestyle with this global budget, not to judge you, but to help you make better choices.",
    np: "तपाईंको क्लाइमेट चेक-अपले तपाईंको जीवनशैलीलाई यो विश्वव्यापी बजेटसँग तुलना गर्छ, तपाईंको न्याय गर्न होइन, तर तपाईंलाई राम्रो निर्णय लिन मद्दत गर्न।"
  },
  {
    en: "Climate awareness starts with measurement. Climate action starts with you.",
    np: "जलवायु सचेतना मापनबाट सुरु हुन्छ। जलवायु कार्य तपाईंबाट सुरु हुन्छ।"
  },
  {
    en: "And you won't walk alone — we aim to make 10,000 Nepali people climate conscious by 2027. Be one of them.",
    np: "र तपाईं एक्लै हिँड्नुहुने छैन — हाम्रो लक्ष्य सन् २०२७ सम्म १०,००० नेपालीलाई जलवायु-सचेत बनाउनु हो। तपाईं पनि एक बन्नुहोस्।"
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
             src={asset('/beaver.png')} 
             alt="Beaver Mascot" 
             className={`${styles.beaverImg} ${isHopping ? styles.hop : ''}`} 
           />
        </div>

      </div>
    </div>
  );
}
