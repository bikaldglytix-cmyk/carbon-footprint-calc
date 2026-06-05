"use client";
import { useState, useEffect } from 'react';
import styles from './FactCards.module.css';
import { questions } from '../data/questions';

export default function FactCards({ currentIdx }) {
  const [expanded, setExpanded] = useState(false);
  
  // Collapse when moving to a new question
  useEffect(() => {
    setExpanded(false);
  }, [currentIdx]);

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className={`${styles.insightContainer} ${expanded ? styles.expanded : ''}`}>
      {!expanded ? (
        <button className={styles.insightToggle} onClick={() => setExpanded(true)}>
          <span className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </span>
          <span className="lang-en">Why ask this?</span>
          <span className="lang-np">किन सोधिएको?</span>
        </button>
      ) : (
        <div className={styles.insightCard}>
          <div className={styles.cardHeader}>
            <div className={styles.titleArea}>
              <span className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </span>
              <span className="lang-en">Why are we asking this?</span>
              <span className="lang-np">यो किन सोधिएको हो?</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setExpanded(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className={styles.cardBody}>
            {q.why && (
              <div className={styles.section}>
                <p className="lang-en">{q.why.en}</p>
                <p className="lang-np">{q.why.np}</p>
              </div>
            )}
            
            {q.sourceUrl && (
              <div className={styles.sectionRelated} style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                <span className={styles.linkIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </span>
                <div>
                  <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: '500' }}>
                    <span className="lang-en">Source</span>
                    <span className="lang-np">स्रोत</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
