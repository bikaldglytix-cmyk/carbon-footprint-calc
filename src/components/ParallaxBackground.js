"use client";
import { useEffect, useState } from 'react';
import styles from './ParallaxBackground.module.css';

export default function ParallaxBackground({ score }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const t = Math.min(1, scrollY / 1200);

  return (
    <div className={styles.landscape} aria-hidden="true" style={{ '--scroll': scrollY, '--t': t, '--score': score }}>
      <div className={styles.skyBg}></div>
      <div className={styles.sun}></div>
      <div className={styles.paperFade}></div>
    </div>
  );
}
