import { useState, useEffect, useRef } from 'react';
import styles from './PremiereShow.module.css';
import { asset } from '../lib/asset';

const CHANGEMAKERS = [
  {
    name: "Bikal Niraula",
    role: "The Tech Mind",
    quote: "The architecture behind Nepal's first Climate Checkup Tool. Bikal transformed complex climate data into a seamless, interactive digital experience, bringing the vision to life through code.",
    image: "/bikal.jpeg",
    position: "center top"
  },
  {
    name: "Manushi Neupane",
    role: "Lead Researcher",
    quote: "Heading to Yale University soon, Manushi's rigorous environmental research forms the foundational backbone of this entire platform. Her work is the science that drives the calculator.",
    image: "/manushi.jpeg"
  },
  {
    name: "Udhyan Shah",
    role: "Key Researcher",
    quote: "Representing Nepal at the World Bank Group Youth Summit 2026. Udhyan's critical insights and relentless research shaped the core of this project. His advice was the compass that guided our journey.",
    image: "/udhyan.jpg"
  },
  {
    name: "Pallavi Kunwar",
    role: "The Mastermind",
    quote: "Climate entrepreneur and the visionary who started it all. Everything here exists because of her passion, sacrifices, and sleepless nights. She is the heart of this project. Long live Aptech Lab.",
    image: "/pallavi.jpeg"
  }
];

export default function PremiereShow({ lang = 'en', audioEnabled, onSkip }) {
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      audioRef.current = new Audio(asset('/premiere-audio.mp3'));
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioEnabled]);

  // Cinematic Timeline (25 seconds total)
  // 0 - 3: Beaver crossing + "Meet our team first"
  // 3 - 19: Team (4s each)
  // 19 - 21: "Aptech Lab Presents"
  // 21 - 24: "Nepal's First Climate Checkup Tool"
  // 24 - 25: Flash white

  const showIntro = elapsed < 3;
  const personIdx = elapsed >= 3 && elapsed < 19 ? Math.floor((elapsed - 3) / 4) : -1;
  const showAptech = elapsed >= 19 && elapsed < 21;
  const showFinalText = elapsed >= 21 && elapsed < 24;
  const showFlash = elapsed >= 24;

  const person = personIdx >= 0 && personIdx < 4 ? CHANGEMAKERS[personIdx] : null;

  return (
    <div className={`${styles.premiereWrapper} ${showFlash ? styles.flashActive : ''}`}>
      
      {/* Skip Button */}
      {onSkip && (
        <button className={styles.skipBtn} onClick={onSkip}>
          Skip Intro
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px'}}>
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
        </button>
      )}

      {/* Cinematic Letterboxing */}
      <div className={styles.letterboxTop} />
      <div className={styles.letterboxBottom} />
      
      {/* Intro Phase */}
      {showIntro && (
        <div className={styles.introPhase}>
          <h1 className={styles.introText}>Meet our team first.</h1>
        </div>
      )}

      {/* Team Phase */}
      {person && (
        <div className={styles.personPhase} key={person.name}>
          <div className={styles.bgImageBlur} style={{ backgroundImage: `url(${asset(person.image)})` }} />
          <div className={styles.bgImageContain} style={{ backgroundImage: `url(${asset(person.image)})` }} />
          <div className={styles.filmGrain} />
          <div className={styles.overlay} />
          
          <div className={styles.content}>
            <div className={styles.infoBox}>
              <h3 className={styles.role}>
                <span className={styles.roleReveal}>{person.role}</span>
              </h3>
              <h2 className={styles.name}>{person.name}</h2>
              <div className={styles.quoteWrapper}>
                <p className={styles.quote}>{person.quote}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aptech Lab Presents Phase */}
      {showAptech && (
        <div className={styles.finalPhase}>
          <h1 className={styles.aptechText}>Aptech Lab Presents</h1>
        </div>
      )}

      {/* Final Text Phase */}
      {showFinalText && (
        <div className={styles.finalPhase}>
          <h1 className={styles.finalText}>
            Nepal's First Climate Checkup Tool
          </h1>
        </div>
      )}

      {/* Flash Overlay */}
      <div className={`${styles.flashOverlay} ${showFlash ? styles.active : ''}`} />
    </div>
  );
}
