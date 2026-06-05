"use client";
import styles from './StoryBackground.module.css';
const getChapterSilhouette = (chapter) => {
  switch(chapter) {
    case 2: // Home & Energy - Image integration
      return (
        <>
          <img src="/house.png" alt="House" className={styles.houseImage1} />
          
          {/* Smoke from House 1 */}
          <svg viewBox="0 0 50 150" className={styles.smokeSvg} preserveAspectRatio="xMidYMax meet">
            <path d="M 25 150 Q 15 100 25 75 T 25 0" fill="none" stroke="var(--paper)" strokeWidth="15" strokeLinecap="round" filter="blur(8px)" />
            <path d="M 25 150 Q 35 100 25 75 T 25 0" fill="none" stroke="var(--paper)" strokeWidth="20" strokeLinecap="round" filter="blur(12px)" opacity="0.8" />
          </svg>

          <img src="/house-2.png" alt="House 2" className={styles.houseImage2} />
          
          <img src="/solar-panel.png" alt="Solar Panel 2" className={styles.imageSolarPanel2} />
        </>
      );
    case 3: // Transport - The Winding Highway
      return (
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet" className={styles.chapterSvg}>
          {/* Airplane in the sky (smaller, moved to the left side) */}
          <g transform="translate(100, 20) scale(0.35) rotate(-10)">
            {/* Contrail */}
            <path d="M -200 20 L 10 20" stroke="var(--paper)" strokeWidth="4" strokeLinecap="round" opacity="0.3" filter="blur(2px)" />
            {/* Fuselage */}
            <rect x="0" y="10" width="100" height="20" rx="10" fill="currentColor" opacity="0.9" />
            {/* Wings */}
            <polygon points="40,20 20,60 35,60 60,30" fill="currentColor" opacity="0.8" />
            <polygon points="50,20 70,-10 60,-10 40,10" fill="currentColor" opacity="0.8" />
            {/* Tail */}
            <polygon points="0,15 -10,-5 5,-5 15,15" fill="currentColor" opacity="0.9" />
            <polygon points="5,25 -5,40 5,40 15,25" fill="currentColor" opacity="0.8" />
            {/* Cockpit Window */}
            <polygon points="85,12 92,12 90,18 85,18" fill="var(--paper)" opacity="0.5" />
          </g>

          <g transform="translate(100, 80) scale(0.8)">
            {/* The Winding Highway */}
            <path d="M 0 300 Q 200 200 400 220 T 800 150 T 1200 200" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round" opacity="0.9" />
            <path d="M 0 310 Q 200 210 400 230 T 800 160 T 1200 210" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" opacity="0.8" />
            
            {/* Highway Support Pillars */}
            <rect x="250" y="240" width="12" height="60" fill="currentColor" opacity="0.75" />
            <rect x="270" y="235" width="12" height="65" fill="currentColor" opacity="0.6" />
            <rect x="550" y="200" width="10" height="100" fill="currentColor" opacity="0.7" />
            <rect x="565" y="195" width="10" height="105" fill="currentColor" opacity="0.55" />
            
            {/* Guardrails (Safety Barriers) */}
            <path d="M 0 282 Q 200 182 400 202 T 800 132 T 1200 182" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.95" strokeDasharray="10 5" />
            <path d="M 0 276 Q 200 176 400 196 T 800 126 T 1200 176" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.85" />
            
            {/* Passenger Bus (Placed perfectly on the curve) */}
            <g transform="translate(140, 205) rotate(-16)">
              {/* Bus Body */}
              <rect x="0" y="0" width="90" height="35" rx="6" fill="currentColor" />
              {/* Front windshield slant */}
              <path d="M 85 0 L 95 15 L 95 35 L 85 35 Z" fill="currentColor" />
              {/* Wheels */}
              <circle cx="20" cy="35" r="8" fill="var(--paper)" opacity="0.3" />
              <circle cx="20" cy="35" r="5" fill="currentColor" />
              <circle cx="75" cy="35" r="8" fill="var(--paper)" opacity="0.3" />
              <circle cx="75" cy="35" r="5" fill="currentColor" />
              {/* Windows */}
              <rect x="5" y="5" width="12" height="12" rx="2" fill="var(--paper)" opacity="0.4" />
              <rect x="20" y="5" width="12" height="12" rx="2" fill="var(--paper)" opacity="0.4" />
              <rect x="35" y="5" width="12" height="12" rx="2" fill="var(--paper)" opacity="0.4" />
              <rect x="50" y="5" width="12" height="12" rx="2" fill="var(--paper)" opacity="0.4" />
              <rect x="65" y="5" width="12" height="12" rx="2" fill="var(--paper)" opacity="0.4" />
              <polygon points="80,5 88,5 92,15 80,15" fill="var(--paper)" opacity="0.3" />
              {/* Headlight Beam */}
              <polygon points="95,25 250,60 250,-10" fill="var(--paper)" opacity="0.1" />
              <circle cx="95" cy="25" r="2" fill="var(--paper)" opacity="0.8" />
              {/* Roof Luggage */}
              <rect x="15" y="-6" width="60" height="6" rx="1" fill="currentColor" opacity="0.85" />
              <path d="M 20 -10 Q 30 -15 40 -10 T 60 -10 L 60 -6 L 20 -6 Z" fill="currentColor" opacity="0.8" />
            </g>

            {/* Small Car (Pulled up) */}
            <g transform="translate(740, 132) rotate(-20)">
              {/* Car Body */}
              <path d="M 0 15 L 10 0 L 35 0 L 45 15 L 55 15 L 60 25 L 60 30 L 0 30 Z" fill="currentColor" opacity="0.95" />
              {/* Wheels */}
              <circle cx="12" cy="30" r="6" fill="var(--paper)" opacity="0.3" />
              <circle cx="12" cy="30" r="3" fill="currentColor" />
              <circle cx="48" cy="30" r="6" fill="var(--paper)" opacity="0.3" />
              <circle cx="48" cy="30" r="3" fill="currentColor" />
              {/* Windows */}
              <polygon points="4,15 13,3 20,3 20,15" fill="var(--paper)" opacity="0.4" />
              <polygon points="23,3 32,3 41,15 23,15" fill="var(--paper)" opacity="0.4" />
              {/* Headlight */}
              <polygon points="60,20 180,45 180,-5" fill="var(--paper)" opacity="0.1" />
              <circle cx="60" cy="20" r="2" fill="var(--paper)" opacity="0.8" />
            </g>
          </g>
        </svg>
      );
    case 4: // Food
      return (
        <>
          <div className={styles.wheatField} />
          
          <img src="/buffalo4.png" alt="Buffalo" className={styles.imageBuffalo} />
          <img src="/foods/apple.png" alt="Apple Tree" className={styles.imageAppleTree} />
          <img src="/food-1.png" alt="Delivery Bike" className={styles.imageFood2} />
        </>
      );
    case 5: // Goods
      return (
        <>
          <img src="/shop.png" alt="Shop 1" className={styles.imageShop1} />
          <img src="/shop-2.png" alt="Shop 2" className={styles.imageShop2} />
        </>
      );
    case 6: // Waste
      return (
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet" className={styles.chapterSvg}>
          {/* Ground Line */}
          <path d="M 0 270 Q 500 290 1000 270 L 1000 300 L 0 300 Z" fill="currentColor" opacity="0.9" />
          
          {/* Left Side: Recycling Station & Compost */}
          <g transform="translate(50, 0)">
            {/* Bin 1 (Paper) */}
            <path d="M 45 230 L 85 230 L 80 220 L 50 220 Z" fill="currentColor" opacity="0.9" />
            <rect x="50" y="230" width="30" height="45" rx="2" fill="currentColor" opacity="0.85" />
            <rect x="55" y="240" width="20" height="2" fill="var(--paper)" opacity="0.2" />
            
            {/* Bin 2 (Plastic) */}
            <path d="M 95 230 L 135 230 L 130 220 L 100 220 Z" fill="currentColor" opacity="0.9" />
            <rect x="100" y="230" width="30" height="45" rx="2" fill="currentColor" opacity="0.85" />
            <rect x="105" y="240" width="20" height="2" fill="var(--paper)" opacity="0.2" />

            {/* Bin 3 (Glass) */}
            <path d="M 145 230 L 185 230 L 180 220 L 150 220 Z" fill="currentColor" opacity="0.9" />
            <rect x="150" y="230" width="30" height="45" rx="2" fill="currentColor" opacity="0.85" />
            <rect x="155" y="240" width="20" height="2" fill="var(--paper)" opacity="0.2" />

            {/* Wooden Compost Bin */}
            <rect x="210" y="210" width="60" height="65" rx="3" fill="currentColor" opacity="0.9" />
            {/* Slat Cutouts */}
            <rect x="210" y="225" width="60" height="4" fill="var(--paper)" opacity="0.3" />
            <rect x="210" y="240" width="60" height="4" fill="var(--paper)" opacity="0.3" />
            <rect x="210" y="255" width="60" height="4" fill="var(--paper)" opacity="0.3" />
            {/* Compost Pile sticking out */}
            <path d="M 220 210 Q 240 190 260 210" fill="currentColor" opacity="0.8" />
          </g>

          {/* Right Side: Garbage/Recycling Truck */}
          <g transform="translate(680, 160)">
            {/* Truck Body (Hopper) */}
            <path d="M 0 10 L 130 10 L 130 100 L 0 100 Z" fill="currentColor" opacity="0.9" />
            <path d="M -10 20 L 0 10 L 0 100 L -10 90 Z" fill="currentColor" opacity="0.8" />
            
            {/* Truck Cab */}
            <path d="M 130 40 L 180 40 Q 195 40 200 65 L 205 100 L 130 100 Z" fill="currentColor" opacity="0.95" />
            
            {/* Cab Window cutout */}
            <polygon points="140,45 175,45 185,65 140,65" fill="var(--paper)" opacity="0.4" />
            
            {/* Headlight */}
            <polygon points="205,80 300,110 300,50" fill="var(--paper)" opacity="0.1" />
            <circle cx="203" cy="80" r="3" fill="var(--paper)" opacity="0.7" />

            {/* Recycling Logo/Stripes on Body */}
            <path d="M 30 30 L 100 30 L 100 80 L 30 80 Z" fill="none" stroke="var(--paper)" strokeWidth="4" strokeDasharray="15 5" opacity="0.2" />
            <circle cx="65" cy="55" r="15" fill="none" stroke="var(--paper)" strokeWidth="3" opacity="0.2" />

            {/* Wheels */}
            <circle cx="35" cy="100" r="14" fill="var(--paper)" opacity="0.2" />
            <circle cx="35" cy="100" r="8" fill="currentColor" />
            <circle cx="165" cy="100" r="14" fill="var(--paper)" opacity="0.2" />
            <circle cx="165" cy="100" r="8" fill="currentColor" />
            
            {/* Exhaust Pipe & Smoke */}
            <path d="M 125 10 L 125 -10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="125" cy="-20" r="5" fill="var(--paper)" opacity="0.2" filter="blur(2px)" />
            <circle cx="115" cy="-30" r="8" fill="var(--paper)" opacity="0.15" filter="blur(3px)" />
            <circle cx="130" cy="-40" r="12" fill="var(--paper)" opacity="0.1" filter="blur(4px)" />
          </g>
        </svg>
      );
    case 7: // Digital
      return (
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet" className={styles.chapterSvg}>
          {/* Defs for Glow Filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ground Line */}
          <path d="M 0 280 Q 500 270 1000 280 L 1000 300 L 0 300 Z" fill="currentColor" opacity="0.9" />

          {/* Left Side: Modern A-Frame Cabin */}
          <g transform="translate(50, 0)">
            {/* Soft Ambient Light Spilling onto ground */}
            <ellipse cx="180" cy="285" rx="100" ry="10" fill="var(--paper)" opacity="0.15" filter="url(#softGlow)" />

            {/* A-Frame Roof (Outer) */}
            <polygon points="180,120 70,290 290,290" fill="currentColor" opacity="0.95" />
            
            {/* A-Frame Overhang/Inner Shadow */}
            <polygon points="180,135 100,290 260,290" fill="currentColor" opacity="0.8" />
            
            {/* Glowing Main Window (Screen Light) */}
            <polygon points="180,165 125,290 235,290" fill="var(--paper)" opacity="0.35" filter="url(#glow)" />
            
            {/* Window Pane Frames (Mullions) */}
            <line x1="180" y1="165" x2="180" y2="290" stroke="currentColor" strokeWidth="4" opacity="0.9" />
            <line x1="150" y1="230" x2="210" y2="230" stroke="currentColor" strokeWidth="4" opacity="0.9" />
            <line x1="135" y1="260" x2="225" y2="260" stroke="currentColor" strokeWidth="4" opacity="0.9" />
            
            {/* Person working at screen (Silhouette inside window) */}
            <circle cx="165" cy="270" r="10" fill="currentColor" opacity="0.95" />
            <path d="M 150 290 Q 165 275 180 290 Z" fill="currentColor" opacity="0.95" />
            {/* Laptop/Monitor silhouette */}
            <rect x="185" y="275" width="15" height="15" rx="1" fill="currentColor" opacity="0.95" />
            {/* Bright screen glow localized on face */}
            <circle cx="178" cy="275" r="15" fill="var(--paper)" opacity="0.2" filter="url(#glow)" />

            {/* Satellite Internet Dish on Roof */}
            {/* Mount */}
            <line x1="235" y1="205" x2="255" y2="180" stroke="currentColor" strokeWidth="4" />
            {/* Dish */}
            <path d="M 240 178 Q 255 190 265 173" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
            
            {/* Digital Signals Emitting */}
            <path d="M 245 160 Q 255 155 265 160" stroke="var(--paper)" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />
            <path d="M 235 145 Q 255 135 275 145" stroke="var(--paper)" strokeWidth="2" fill="none" opacity="0.15" strokeLinecap="round" />
            <path d="M 225 130 Q 255 115 285 130" stroke="var(--paper)" strokeWidth="2" fill="none" opacity="0.1" strokeLinecap="round" />
          </g>

          {/* Right Side: Pine Trees in the Wilderness */}
          <g fill="currentColor" opacity="0.9">
            {/* Tree 1 */}
            <g transform="translate(720, 170)">
              <rect x="18" y="90" width="4" height="20" />
              <path d="M 20 0 L 0 35 L 10 35 L -10 70 L 10 70 L -20 105 L 60 105 L 30 70 L 50 70 L 30 35 L 40 35 Z" />
            </g>
            
            {/* Tree 2 (Taller) */}
            <g transform="translate(800, 120) scale(1.3)">
              <rect x="18" y="90" width="4" height="25" />
              <path d="M 20 0 L 0 35 L 10 35 L -10 70 L 10 70 L -20 105 L 60 105 L 30 70 L 50 70 L 30 35 L 40 35 Z" />
            </g>
            
            {/* Tree 3 (Smaller, further back) */}
            <g transform="translate(920, 200) scale(0.8)">
              <rect x="18" y="90" width="4" height="15" />
              <path d="M 20 0 L 0 35 L 10 35 L -10 70 L 10 70 L -20 105 L 60 105 L 30 70 L 50 70 L 30 35 L 40 35 Z" opacity="0.8" />
            </g>
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export default function StoryBackground({ score, progress, timeOfDay, chapter = 1 }) {
  const isNight = timeOfDay === 'night';
  // Birds sleep at night
  const numBirds = isNight ? 0 : Math.max(0, Math.floor(15 * (1 - score)));
  const birds = Array.from({ length: 15 });
  const stars = Array.from({ length: 40 });

  return (
    <div className={styles.canvas} aria-hidden="true" data-time={timeOfDay} data-chapter={chapter} style={{ '--score': score, '--progress': progress }}>
      <div className={styles.skyGradient}></div>
      
      {/* Stars (Only visible at night, faded by pollution) */}
      <div className={styles.stars}>
        {stars.map((_, i) => (
          <div 
            key={i} 
            className={styles.star} 
            style={{
              top: `${Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              transform: `scale(${0.5 + Math.random()})`
            }}
          ></div>
        ))}
      </div>
      
      {/* Sun / Moon */}
      <div className={styles.sun}></div>
      
      {/* Drifting Clouds */}
      <div className={styles.clouds}>
        <div className={styles.cloud1}>
           <svg viewBox="0 0 100 50" fill="currentColor"><path d="M 20 30 a 15 15 0 0 1 20 -10 a 20 20 0 0 1 35 5 a 15 15 0 0 1 5 25 h -60 a 10 10 0 0 1 -5 -20 z"/></svg>
        </div>
        <div className={styles.cloud2}>
           <svg viewBox="0 0 100 50" fill="currentColor"><path d="M 20 30 a 15 15 0 0 1 20 -10 a 20 20 0 0 1 35 5 a 15 15 0 0 1 5 25 h -60 a 10 10 0 0 1 -5 -20 z"/></svg>
        </div>
        <div className={styles.cloud3}>
           <svg viewBox="0 0 100 50" fill="currentColor"><path d="M 20 30 a 15 15 0 0 1 20 -10 a 20 20 0 0 1 35 5 a 15 15 0 0 1 5 25 h -60 a 10 10 0 0 1 -5 -20 z"/></svg>
        </div>
      </div>

      {/* Flocks of Birds */}
      <div className={styles.flock}>
        {birds.map((_, i) => (
          <svg 
            key={i} 
            className={`${styles.bird} ${i >= numBirds ? styles.birdHidden : ''}`}
            style={{ 
              '--delay': `${i * 0.7}s`, 
              '--top': `${15 + (i % 4) * 8}%`,
              '--scale': 0.4 + (i % 3) * 0.3,
              '--dur': `${20 + (i % 5) * 5}s`
            }} 
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M 2 14 Q 7 8 12 12 Q 17 8 22 14 Q 17 12 12 16 Q 7 12 2 14 Z" />
          </svg>
        ))}
      </div>
      
      {/* Mountains */}
      <div className={styles.mountains}>
        <svg className={styles.mountainFar} viewBox="0 0 1000 300" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,300 L0,150 L100,200 L200,80 L300,180 L450,50 L600,160 L750,90 L900,180 L1000,110 L1000,300 Z" />
        </svg>
        <svg className={styles.mountainMid} viewBox="0 0 1000 300" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,300 L0,220 L150,180 L350,250 L500,170 L700,240 L850,190 L1000,230 L1000,300 Z" />
        </svg>
      </div>

      {/* Chapter-Specific Silhouettes */}
      {chapter > 1 && (
        <div className={styles.chapterForeground} key={`chapter-${chapter}`}>
          {getChapterSilhouette(chapter)}
        </div>
      )}

      <div className={styles.paperFade}></div>

      {/* Flying Lanterns — only at night */}
      {timeOfDay === 'night' && (
        <div className={styles.lanterns}>
          <div className={`${styles.lantern}`} style={{ '--lx': '20%', '--delay': '0s', '--dur': '18s' }}>
            <svg viewBox="0 0 30 45" fill="none">
              <ellipse cx="15" cy="25" rx="11" ry="15" fill="rgba(255,200,80,0.85)" />
              <rect x="13" y="38" width="4" height="5" rx="1" fill="rgba(255,160,40,0.7)" />
              <line x1="15" y1="10" x2="15" y2="2" stroke="rgba(255,180,60,0.5)" strokeWidth="1" />
              <ellipse cx="15" cy="25" rx="11" ry="15" fill="rgba(255,220,120,0.25)" />
            </svg>
            <div className={styles.lanternGlow}></div>
          </div>
          <div className={`${styles.lantern}`} style={{ '--lx': '55%', '--delay': '-6s', '--dur': '22s' }}>
            <svg viewBox="0 0 30 45" fill="none">
              <ellipse cx="15" cy="25" rx="11" ry="15" fill="rgba(255,180,60,0.8)" />
              <rect x="13" y="38" width="4" height="5" rx="1" fill="rgba(255,140,30,0.7)" />
              <line x1="15" y1="10" x2="15" y2="2" stroke="rgba(255,180,60,0.5)" strokeWidth="1" />
              <ellipse cx="15" cy="25" rx="11" ry="15" fill="rgba(255,220,120,0.2)" />
            </svg>
            <div className={styles.lanternGlow}></div>
          </div>
          <div className={`${styles.lantern}`} style={{ '--lx': '78%', '--delay': '-12s', '--dur': '20s' }}>
            <svg viewBox="0 0 30 45" fill="none">
              <ellipse cx="15" cy="25" rx="11" ry="15" fill="rgba(255,210,100,0.9)" />
              <rect x="13" y="38" width="4" height="5" rx="1" fill="rgba(255,160,40,0.7)" />
              <line x1="15" y1="10" x2="15" y2="2" stroke="rgba(255,180,60,0.5)" strokeWidth="1" />
              <ellipse cx="15" cy="25" rx="11" ry="15" fill="rgba(255,240,160,0.2)" />
            </svg>
            <div className={styles.lanternGlow}></div>
          </div>
        </div>
      )}
    </div>
  );
}
