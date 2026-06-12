import { useState, useEffect } from 'react';
import styles from './LaunchCountdown.module.css';
import { asset } from '../lib/asset';

export default function LaunchCountdown({ targetDateEpoch, getTrueTime, lang = 'en', audioEnabled, setAudioEnabled }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // If it's already past the time, complete immediately
    if (targetDateEpoch <= getTrueTime()) {
      return;
    }

    const calculateTime = () => {
      const now = getTrueTime();
      const difference = targetDateEpoch - now;
      
      if (difference <= 0) {
        return 0;
      }
      return difference;
    };

    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      const remaining = calculateTime();
      if (remaining <= 0) {
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDateEpoch, getTrueTime]);

  if (!isClient || timeLeft === null || timeLeft <= 0) return null;

  const h = Math.floor(timeLeft / (1000 * 60 * 60));
  const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {lang === 'en' ? 'Launching in...' : 'सुरु हुँदैछ...'}
        </h1>
        
        {!audioEnabled ? (
          <button 
            className={styles.enableAudioBtn} 
            onClick={() => {
              // Dummy audio play to unlock browser policy
              const audio = new Audio();
              audio.play().catch(() => {});
              setAudioEnabled(true);
            }}
          >
            Click to Enter Waiting Room
          </button>
        ) : (
          <div className={styles.timer}>
            {h > 0 && (
              <>
                <div className={styles.timeBox}>
                  <span className={styles.number}>{h.toString().padStart(2, '0')}</span>
                  <span className={styles.label}>HR</span>
                </div>
                <span className={styles.colon}>:</span>
              </>
            )}
            <div className={styles.timeBox}>
              <span className={styles.number}>{m.toString().padStart(2, '0')}</span>
              <span className={styles.label}>MIN</span>
            </div>
            <span className={styles.colon}>:</span>
            <div className={styles.timeBox}>
              <span className={styles.number}>{s.toString().padStart(2, '0')}</span>
              <span className={styles.label}>SEC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
