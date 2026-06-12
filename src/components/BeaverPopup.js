"use client";
import { useState, useEffect } from 'react';
import styles from './BeaverPopup.module.css';
import { questions } from '../data/questions';
import { asset } from '../lib/asset';

export default function BeaverPopup({ currentIdx }) {
  const [visible, setVisible] = useState(false);
  const [showPlacard, setShowPlacard] = useState(false);
  const [hasFact, setHasFact] = useState(false);

  const q = questions[currentIdx];

  // Reset state on new question
  useEffect(() => {
    setVisible(false);
    setShowPlacard(false);
    
    if (q && q.fact && (q.fact.en || q.fact.np)) {
      setHasFact(true);
      console.log('[BeaverPopup] Fact found for Q', currentIdx, '— will show in 500ms');
      // Wait 500ms before the beaver sneaks in
      const timer = setTimeout(() => {
        setVisible(true);
        console.log('[BeaverPopup] Now visible');
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setHasFact(false);
      console.log('[BeaverPopup] No fact for Q', currentIdx);
    }
  }, [currentIdx, q]);

  if (!hasFact) return null;

  const getChapterNum = (idx) => {
    if (!questions[idx]) return 1;
    const cat = questions[idx].category.en;
    if (cat === 'Home & Energy') return 2;
    if (cat === 'Transport') return 3;
    if (cat === 'Food') return 4;
    if (cat === 'Consumption') return 5;
    if (cat === 'Waste') return 6;
    if (cat === 'Digital') return 7;
    return 1;
  };
  const chapterNum = getChapterNum(currentIdx);
  const chapterColors = {
    1: 'var(--teal)',
    2: 'var(--saffron)',
    3: 'var(--sky)',
    4: '#2ecc71',
    5: 'var(--coral)',
    6: '#8e44ad',
    7: '#34495e'
  };
  const activeColor = chapterColors[chapterNum] || 'var(--teal)';

  return (
    <div className={`${styles.beaverContainer} ${visible ? styles.sneakedIn : ''} ${showPlacard ? styles.slightlyUp : ''}`} style={{ '--chapter-color': activeColor }}>
      {/* The Placard */}
      {showPlacard && (
        <div className={styles.placardContainer}>
          <div className={styles.placard}>
            <div className={styles.placardWood}>
              <button className={styles.closeBtn} onClick={() => setShowPlacard(false)}>✕</button>
              <h4 className={styles.placardTitle}>
                <span className="lang-en">Fun Fact!</span>
                <span className="lang-np">रोचक तथ्य!</span>
              </h4>
              <p className="lang-en">{q.fact.en}</p>
              <p className="lang-np">{q.fact.np}</p>
            </div>
            <div className={styles.placardStick}></div>
          </div>
        </div>
      )}

      {/* Click Me prompt when placard is closed */}
      {!showPlacard && (
        <div className={styles.clickMePrompt}>
          <span className="lang-en">Click me!</span>
          <span className="lang-np">मलाई थिच्नुहोस्!</span>
        </div>
      )}

      {/* The Beaver Image */}
      <button 
        className={styles.beaverButton} 
        onClick={() => setShowPlacard(!showPlacard)}
        aria-label="Fun Fact Beaver"
      >
        <img 
          src={asset('/beaver.png')}
          alt="Beaver with a fun fact" 
          className={styles.beaverImg} 
        />
      </button>
    </div>
  );
}
