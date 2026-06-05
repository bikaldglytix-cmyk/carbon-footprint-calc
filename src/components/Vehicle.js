"use client";
import styles from './Vehicle.module.css';

export default function Vehicle({ timeOfDay, score }) {
  // We use different SVGs based on timeOfDay.
  return (
    <div className={styles.vehicleTrack}>
      <div className={`${styles.vehicleWrapper} ${styles[timeOfDay]}`} key={timeOfDay}>
        
        {timeOfDay === 'morning' && (
          // Simple Belgada SVG (Bullock Cart)
          <svg viewBox="0 0 100 50" className={styles.vehicleSvg} fill="currentColor">
            <rect x="10" y="25" width="30" height="10" rx="2" />
            <circle cx="20" cy="40" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="20" cy="40" r="2" />
            <circle cx="35" cy="40" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="35" cy="40" r="2" />
            <path d="M 45 25 L 70 25 L 75 15 L 85 15 L 85 30 L 75 35 L 75 45 L 70 45 L 70 35 L 55 35 L 55 45 L 50 45 L 50 28 Z" />
            <line x1="40" y1="28" x2="65" y2="28" stroke="currentColor" strokeWidth="2" />
            <path d="M 20 15 Q 25 5 30 15 L 30 25 L 20 25 Z" />
          </svg>
        )}
        
        {timeOfDay === 'afternoon' && (
          // Motorbike SVG
          <svg viewBox="0 0 100 50" className={styles.vehicleSvg} fill="currentColor">
            <circle cx="25" cy="35" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <circle cx="75" cy="35" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 25 35 L 40 20 L 60 20 L 75 35" stroke="currentColor" strokeWidth="4" fill="none" strokeLinejoin="round" />
            <path d="M 45 20 L 40 5 A 6 6 0 1 1 50 5 L 60 15" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        )}

        {timeOfDay === 'evening' && (
          // Bicycle SVG
          <svg viewBox="0 0 100 50" className={styles.vehicleSvg} fill="currentColor">
            <circle cx="25" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="75" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M 25 35 L 45 15 L 70 15 L 75 35 M 45 15 L 55 35 M 70 15 L 55 35" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 50 30 L 40 10 A 5 5 0 1 1 48 5 L 65 13" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        )}

        {timeOfDay === 'night' && (
          // Car SVG with Headlights
          <div className={styles.carContainer}>
            <svg viewBox="0 0 100 50" className={styles.vehicleSvg} fill="currentColor">
              <circle cx="25" cy="40" r="8" fill="currentColor" />
              <circle cx="75" cy="40" r="8" fill="currentColor" />
              <path d="M 10 35 L 10 25 L 30 15 L 70 15 L 90 25 L 95 35 Z" />
            </svg>
            {/* Glowing headlight beam */}
            <div className={styles.headlight}></div>
          </div>
        )}
      </div>
    </div>
  );
}
