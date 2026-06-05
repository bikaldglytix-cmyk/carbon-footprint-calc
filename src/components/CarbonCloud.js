"use client";
import React, { useEffect, useState } from 'react';
import styles from './CarbonCloud.module.css';

export default function CarbonCloud({ total }) {
  const [prevTotal, setPrevTotal] = useState(total);
  const [isMelting, setIsMelting] = useState(false);
  
  const averageNepal = 0.5; // Tons of CO2e
  const isHigh = total >= averageNepal;

  useEffect(() => {
    if (total > prevTotal) {
      setIsMelting(true);
      const t = setTimeout(() => setIsMelting(false), 600);
      setPrevTotal(total);
      return () => clearTimeout(t);
    }
  }, [total, prevTotal]);

  // Stage-based melting logic mapped exactly to total CO2e tons
  let cubeScale = 1;
  let puddleScaleX = 1;
  let puddleScaleY = 1;
  let showCracks = false;
  let showDrips = false;
  let isVaporizing = false;
  let steamOpacity = 0;
  let puddleOpacity = 0.8;

  if (total < 0.5) {
    // Stage 0: Pristine (Below Nepal Average)
    cubeScale = 1;
    puddleScaleX = 0;
    puddleScaleY = 0;
    puddleOpacity = 0;
  } else if (total < 1.0) {
    // Stage 1: Softening
    cubeScale = 0.8;
    puddleScaleX = 1.5;
    puddleScaleY = 1.2;
    showDrips = true;
  } else if (total < 1.5) {
    // Stage 2: Heavy Melting
    cubeScale = 0.5;
    puddleScaleX = 2.5;
    puddleScaleY = 1.8;
    showCracks = true;
    showDrips = true;
  } else if (total < 2.0) {
    // Stage 3: Almost gone
    cubeScale = 0.2;
    puddleScaleX = 3.5;
    puddleScaleY = 2.5;
    showCracks = true;
  } else if (total < 2.5) {
    // Stage 4: Completely Melted (Hits this at 2.0 tons)
    cubeScale = 0;
    puddleScaleX = 4.0;
    puddleScaleY = 2.8;
    steamOpacity = 0.4;
  } else {
    // Stage 5: Vaporized (2.5+ tons)
    cubeScale = 0;
    puddleScaleX = 1.5;
    puddleScaleY = 0.8;
    isVaporizing = true;
    puddleOpacity = 0.2;
    steamOpacity = 1;
  }

  // Background glow temperature shift (Cool Blue -> Burning Red)
  const getGlowColor = (t) => {
    const heatLevel = Math.min(t / 3.0, 1); // Max heat at 3.0 tons
    const r = Math.round(128 + heatLevel * (235 - 128));
    const g = Math.round(222 + heatLevel * (77 - 222));
    const b = Math.round(234 + heatLevel * (75 - 234));
    const a = 0.2 + (heatLevel * 0.4);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  const glowColor = getGlowColor(total);

  return (
    <div className={styles.wrapper}>
      <div className={styles.sceneContainer}>
        {/* Atmospheric Heat Glow */}
        <div 
          className={styles.heatGlow} 
          style={{ 
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            transform: `scale(${1 + Math.min(total / 2.0, 1.5)})`,
            opacity: total > 0.5 ? 1 : 0.5
          }} 
        />

        <svg viewBox="0 0 300 300" className={styles.svgScene}>
          
          {/* Steam/Vapor */}
          <g opacity={steamOpacity} style={{ transition: 'opacity 1s ease' }}>
            <path className={styles.steam1} d="M 130 220 Q 110 170 140 120 T 130 40" fill="none" stroke="#E0F7FA" strokeWidth="4" strokeLinecap="round" />
            <path className={styles.steam2} d="M 160 230 Q 190 180 150 130 T 170 50" fill="none" stroke="#E0F7FA" strokeWidth="6" strokeLinecap="round" />
            <path className={styles.steam3} d="M 180 210 Q 150 160 190 110 T 170 30" fill="none" stroke="#E0F7FA" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Puddle */}
          <ellipse 
            cx="150" 
            cy="230" 
            rx="45" 
            ry="18" 
            fill="#B2EBF2" 
            opacity={puddleOpacity}
            style={{ 
              transform: `scale(${puddleScaleX}, ${puddleScaleY})`, 
              transformOrigin: '150px 230px', 
              transition: 'transform 1s ease, opacity 1s ease' 
            }} 
          />

          {/* Ice Block Wrapper for Bounce/Thud Animation */}
          <g className={`${styles.iceCubeWrapper} ${isMelting ? styles.meltThud : ''}`}>
            
            {/* Scaling Group for the Melting Effect */}
            <g 
              style={{ 
                transform: `scale(${cubeScale})`, 
                transformOrigin: '150px 230px', 
                transition: 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                opacity: cubeScale > 0 ? 1 : 0
              }}
            >
              {/* Isometric Cube Faces */}
              {/* Top Face */}
              <polygon points="150,90 230,130 150,170 70,130" fill="#E0F7FA" stroke="#B2EBF2" strokeWidth="2" strokeLinejoin="round" />
              {/* Left Face */}
              <polygon points="70,130 150,170 150,240 70,200" fill="#B2EBF2" stroke="#80DEEA" strokeWidth="2" strokeLinejoin="round" />
              {/* Right Face */}
              <polygon points="150,170 230,130 230,200 150,240" fill="#80DEEA" stroke="#4DD0E1" strokeWidth="2" strokeLinejoin="round" />
              
              {/* Cracks (Fade in dynamically as it melts) */}
              <g opacity={showCracks ? 1 : 0} style={{ transition: 'opacity 1s ease' }}>
                <path d="M 150 170 L 130 200 L 140 220" fill="none" stroke="#E0F7FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 230 150 L 190 160 L 170 210" fill="none" stroke="#E0F7FA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 110 110 L 130 130 L 110 150" fill="none" stroke="#80DEEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 150 130 L 180 140 L 170 155" fill="none" stroke="#B2EBF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              
              {/* Specular Highlight (Shiny Ice edges) */}
              <path d="M 150 95 L 215 128 L 150 160 L 85 128 Z" fill="rgba(255,255,255,0.4)" />
              <path d="M 75 135 L 85 140 L 85 195 L 75 190 Z" fill="rgba(255,255,255,0.2)" />
            </g>

          </g>

          {/* Drip / Sweat drops falling when footprint is high */}
          {showDrips && (
             <g className={styles.dripGroup}>
               <path className={styles.drip1} d="M 110 170 Q 110 180 105 180 Q 100 180 100 170 Q 105 160 110 170 Z" fill="#80DEEA" />
               <path className={styles.drip2} d="M 190 180 Q 190 190 185 190 Q 180 190 180 180 Q 185 170 190 180 Z" fill="#4DD0E1" />
             </g>
          )}

        </svg>
      </div>
    </div>
  );
}
