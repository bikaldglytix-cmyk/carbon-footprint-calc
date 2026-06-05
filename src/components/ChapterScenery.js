import React from 'react';
import styles from './ChapterScenery.module.css';

/*
  ChapterScenery renders colorful, cartoon-style SVG landscapes
  for each chapter.
*/
export default function ChapterScenery({ chapter }) {
  const ch = Number(chapter);

  return (
    <div className={styles.container} data-chapter={ch}>
      <div className={styles.layerFar}>
        <SceneFar ch={ch} />
      </div>
      <div className={styles.layerMid}>
        <SceneMid ch={ch} />
      </div>
    </div>
  );
}

function SceneFar({ ch }) {
  switch (ch) {
    case 1: return <GeographyFar />;
    case 2: return <HomeFar />;
    case 3: return <TransportFar />;
    case 4: return <FoodFar />;
    case 5: return <GoodsFar />;
    case 6: return <WasteFar />;
    case 7: return <DigitalFar />;
    default: return <GeographyFar />;
  }
}

function SceneMid({ ch }) {
  switch (ch) {
    case 1: return <GeographyMid />;
    case 2: return <HomeMid />;
    case 3: return <TransportMid />;
    case 4: return <FoodMid />;
    case 5: return <GoodsMid />;
    case 6: return <WasteMid />;
    case 7: return <DigitalMid />;
    default: return <GeographyMid />;
  }
}

/* ===================== Ch 1: GEOGRAPHY ===================== */
function GeographyFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Distant peaks */}
      <path d="M0,400 L0,200 L80,250 L180,100 L280,220 L380,60 L480,180 L580,40 L680,160 L780,80 L880,200 L980,120 L1080,180 L1200,140 L1200,400 Z" fill="#b0c4de" />
      {/* Snow caps */}
      <path d="M180,100 L140,160 L180,140 L220,170 Z M380,60 L330,130 L380,110 L430,120 Z M580,40 L545,95 L580,80 L630,100 Z M780,80 L750,125 L790,110 L830,130 Z M980,120 L940,160 L980,140 L1020,150 Z" fill="#ffffff" />
    </svg>
  );
}
function GeographyMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Rolling foothills */}
      <path d="M0,400 L0,280 Q100,230 200,270 T400,240 T600,280 T800,230 T1000,260 L1200,250 L1200,400 Z" fill="#8fbc8f" />
      {/* Cartoon Trees */}
      <Tree cx="150" cy="260" />
      <Tree cx="180" cy="255" />
      <Tree cx="210" cy="262" scale="0.8" />
      <Tree cx="500" cy="270" />
      <Tree cx="530" cy="265" scale="1.2" />
      <Tree cx="560" cy="275" scale="0.9" />
      <Tree cx="900" cy="250" />
      <Tree cx="930" cy="245" scale="1.1" />
    </svg>
  );
}

/* ===================== Ch 2: HOME & ENERGY ===================== */
function HomeFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      <path d="M0,400 L0,220 Q200,160 400,210 T800,180 T1200,220 L1200,400 Z" fill="#c3d5a0" />
      <Tree cx="100" cy="210" scale="0.8" />
      <Tree cx="130" cy="205" scale="0.7" />
      <Tree cx="700" cy="190" scale="0.9" />
      <Tree cx="1050" cy="210" scale="0.8" />
    </svg>
  );
}
function HomeMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Ground */}
      <path d="M0,400 L0,310 Q300,290 600,310 T1200,300 L1200,400 Z" fill="#9db576" />
      
      {/* Cartoon House 1 */}
      <rect x="60" y="240" width="80" height="70" fill="#fdf5e6" />
      <polygon points="50,240 100,180 150,240" fill="#cd5c5c" />
      <rect x="85" y="260" width="16" height="20" fill="#add8e6" stroke="#4682b4" strokeWidth="2" />
      
      {/* Cartoon House 2 */}
      <rect x="240" y="210" width="100" height="100" fill="#ffefd5" />
      <polygon points="230,210 290,140 350,210" fill="#a0522d" />
      <rect x="310" y="155" width="14" height="55" fill="#808080" />
      {/* Smoke */}
      <circle cx="317" cy="145" r="8" fill="#e0e0e0" opacity="0.8" />
      <circle cx="322" cy="130" r="10" fill="#e0e0e0" opacity="0.6" />
      <circle cx="315" cy="115" r="12" fill="#e0e0e0" opacity="0.4" />
      <rect x="260" y="240" width="20" height="25" fill="#add8e6" stroke="#4682b4" strokeWidth="2" />
      <rect x="300" y="240" width="20" height="25" fill="#add8e6" stroke="#4682b4" strokeWidth="2" />

      {/* Fence */}
      <rect x="158" y="296" width="68" height="4" fill="#deb887" />
      <rect x="165" y="290" width="6" height="20" fill="#deb887" />
      <rect x="185" y="290" width="6" height="20" fill="#deb887" />
      <rect x="205" y="290" width="6" height="20" fill="#deb887" />

      {/* Cartoon House 3 */}
      <rect x="480" y="230" width="140" height="80" fill="#f0fff0" />
      <polygon points="470,230 550,155 630,230" fill="#4682b4" />
      <rect x="510" y="250" width="25" height="30" fill="#add8e6" stroke="#5f9ea0" strokeWidth="2" />
      <rect x="580" y="250" width="25" height="30" fill="#add8e6" stroke="#5f9ea0" strokeWidth="2" />
      <rect x="545" y="260" width="24" height="50" fill="#8b4513" />
      <circle cx="563" cy="285" r="3" fill="#ffd700" /> {/* Doorknob */}

      {/* House 4 */}
      <rect x="720" y="260" width="70" height="50" fill="#ffe4c4" />
      <polygon points="710,260 755,210 800,260" fill="#2e8b57" />

      <Tree cx="680" cy="250" scale="1.4" />
      
      {/* Power lines */}
      <rect x="425" y="170" width="6" height="140" fill="#555" />
      <rect x="850" y="180" width="6" height="130" fill="#555" />
      <path d="M428,175 Q640,230 853,185" fill="none" stroke="#333" strokeWidth="2" />
    </svg>
  );
}

/* ===================== Ch 3: TRANSPORT ===================== */
function TransportFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* City skyline colored */}
      <path d="M0,400 L0,250 L60,250 L60,180 L90,180 L90,240 L140,240 L140,150 L180,150 L180,260 L280,260 L280,120 L320,120 L320,200 L400,200 L400,100 L440,100 L440,250 L550,250 L550,170 L600,170 L600,220 L700,220 L700,130 L740,130 L740,250 L860,250 L860,180 L910,180 L910,230 L1000,230 L1000,160 L1050,160 L1050,240 L1200,240 L1200,400 Z" fill="#a9a9a9" />
      <rect x="418" y="70" width="4" height="30" fill="#888" />
    </svg>
  );
}
function TransportMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Road */}
      <path d="M0,400 L0,290 Q300,260 600,290 T1200,270 L1200,400 Z" fill="#696969" />
      {/* Road striping */}
      <path d="M0,340 Q300,310 600,340 T1200,320" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="20, 20" />

      {/* Bridge pillars */}
      <rect x="240" y="292" width="16" height="110" fill="#808080" />
      <rect x="340" y="292" width="16" height="110" fill="#808080" />
      <rect x="450" y="292" width="16" height="110" fill="#808080" />
      <rect x="200" y="280" width="300" height="16" rx="4" fill="#a9a9a9" />

      {/* Traffic Light */}
      <rect x="180" y="220" width="8" height="90" fill="#555" />
      <rect x="169" y="160" width="30" height="70" rx="6" fill="#333" />
      <circle cx="184" cy="175" r="8" fill="#ff4500" />
      <circle cx="184" cy="195" r="8" fill="#ffd700" />
      <circle cx="184" cy="215" r="8" fill="#32cd32" />

      {/* Cartoon Bus */}
      <g transform="translate(620, 240)">
        <rect x="0" y="0" width="140" height="60" rx="8" fill="#ffd700" /> {/* Yellow bus */}
        <rect x="10" y="10" width="25" height="25" rx="4" fill="#87ceeb" />
        <rect x="45" y="10" width="25" height="25" rx="4" fill="#87ceeb" />
        <rect x="80" y="10" width="25" height="25" rx="4" fill="#87ceeb" />
        <rect x="115" y="10" width="15" height="25" rx="4" fill="#87ceeb" />
        <circle cx="30" cy="65" r="12" fill="#333" /> {/* Wheel */}
        <circle cx="30" cy="65" r="6" fill="#ccc" />
        <circle cx="110" cy="65" r="12" fill="#333" />
        <circle cx="110" cy="65" r="6" fill="#ccc" />
        <rect x="135" y="45" width="6" height="10" fill="#ff0000" /> {/* Taillight */}
      </g>

      {/* Cartoon Car */}
      <g transform="translate(850, 290)">
        <path d="M 10 30 L 20 10 L 60 10 L 70 30 L 90 30 C 100 30 100 45 90 45 L 10 45 C 0 45 0 30 10 30 Z" fill="#ff4500" />
        <path d="M 25 15 L 40 15 L 40 30 L 15 30 Z" fill="#87ceeb" />
        <path d="M 45 15 L 55 15 L 65 30 L 45 30 Z" fill="#87ceeb" />
        <circle cx="25" cy="45" r="10" fill="#333" />
        <circle cx="25" cy="45" r="4" fill="#ccc" />
        <circle cx="75" cy="45" r="10" fill="#333" />
        <circle cx="75" cy="45" r="4" fill="#ccc" />
      </g>

      {/* Street Lamp */}
      <rect x="1000" y="200" width="6" height="110" fill="#555" />
      <ellipse cx="1003" cy="195" rx="18" ry="6" fill="#ffd700" />
    </svg>
  );
}

/* ===================== Ch 4: FOOD ===================== */
function FoodFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Background Hills */}
      <path d="M0,400 L0,180 Q200,100 400,190 T800,160 T1200,190 L1200,400 Z" fill="#9acd32" />
      <path d="M0,400 L0,220 Q300,180 600,240 T1200,210 L1200,400 Z" fill="#8fbc8f" />
      {/* Distant Barn */}
      <g transform="translate(850, 150)">
        <rect x="0" y="20" width="60" height="40" fill="#b22222" />
        <polygon points="-5,20 30,0 65,20" fill="#8b0000" />
        <rect x="20" y="30" width="20" height="30" fill="#f5deb3" />
        <line x1="20" y1="30" x2="40" y2="60" stroke="#8b0000" strokeWidth="2" />
        <line x1="40" y1="30" x2="20" y2="60" stroke="#8b0000" strokeWidth="2" />
      </g>
    </svg>
  );
}
function FoodMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Foreground Field */}
      <path d="M0,400 L0,280 Q300,250 600,280 T1200,270 L1200,400 Z" fill="#6b8e23" />
      
      {/* Soil Rows */}
      <path d="M100,320 L150,280 L200,280 L150,320 Z" fill="#8b4513" />
      <path d="M180,330 L220,280 L270,280 L230,330 Z" fill="#8b4513" />
      <path d="M260,340 L290,280 L340,280 L310,340 Z" fill="#8b4513" />
      
      {/* Crops (Pumpkins & Greens) */}
      <circle cx="150" cy="300" r="12" fill="#ff8c00" />
      <circle cx="210" cy="305" r="14" fill="#ff8c00" />
      <circle cx="280" cy="315" r="16" fill="#ff8c00" />
      <path d="M150,288 Q145,280 155,280 Q160,288 150,288" fill="#228b22" />
      <path d="M210,291 Q205,283 215,283 Q220,291 210,291" fill="#228b22" />
      <path d="M280,299 Q275,291 285,291 Q290,299 280,299" fill="#228b22" />

      {/* Apple Trees */}
      <g transform="translate(900, 160)">
        <rect x="40" y="50" width="20" height="70" fill="#8b4513" />
        <circle cx="50" cy="30" r="45" fill="#228b22" />
        <circle cx="30" cy="15" r="8" fill="#ff0000" />
        <circle cx="65" cy="20" r="8" fill="#ff0000" />
        <circle cx="45" cy="50" r="8" fill="#ff0000" />
        <circle cx="20" cy="40" r="8" fill="#ff0000" />
        <circle cx="70" cy="45" r="8" fill="#ff0000" />
      </g>
      <g transform="translate(1000, 180)">
        <rect x="30" y="40" width="16" height="60" fill="#8b4513" />
        <circle cx="38" cy="20" r="35" fill="#2e8b57" />
        <circle cx="25" cy="10" r="6" fill="#ff0000" />
        <circle cx="50" cy="25" r="6" fill="#ff0000" />
        <circle cx="20" cy="30" r="6" fill="#ff0000" />
      </g>

      {/* Detailed Tractor */}
      <g transform="translate(450, 210)">
        <rect x="10" y="40" width="100" height="40" rx="8" fill="#ff0000" /> {/* Tractor body */}
        <rect x="70" y="10" width="40" height="40" rx="4" fill="#ff0000" /> {/* Cabin */}
        <rect x="75" y="15" width="30" height="25" fill="#add8e6" /> {/* Cabin window */}
        <rect x="25" y="20" width="6" height="20" fill="#d3d3d3" /> {/* Exhaust */}
        <path d="M25,20 L35,15 L35,10" fill="none" stroke="#d3d3d3" strokeWidth="4" />
        <circle cx="30" cy="80" r="20" fill="#333" /> {/* Front wheel */}
        <circle cx="30" cy="80" r="10" fill="#ccc" />
        <circle cx="90" cy="70" r="35" fill="#333" /> {/* Big rear wheel */}
        <circle cx="90" cy="70" r="15" fill="#ffd700" /> {/* Yellow hub */}
      </g>
    </svg>
  );
}

/* ===================== Ch 5: GOODS ===================== */
function GoodsFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      <path d="M0,400 L0,250 Q200,230 400,250 T800,230 T1200,250 L1200,400 Z" fill="#d3d3d3" />
      {/* Factory with Sawtooth Roof */}
      <g transform="translate(100, 150)">
        <rect x="0" y="50" width="300" height="100" fill="#778899" />
        <polygon points="0,50 30,20 60,50" fill="#a9a9a9" />
        <polygon points="60,50 90,20 120,50" fill="#a9a9a9" />
        <polygon points="120,50 150,20 180,50" fill="#a9a9a9" />
        <polygon points="180,50 210,20 240,50" fill="#a9a9a9" />
        <polygon points="240,50 270,20 300,50" fill="#a9a9a9" />
        {/* Large Chimneys */}
        <rect x="200" y="-30" width="20" height="80" fill="#8b0000" />
        <rect x="240" y="-10" width="20" height="60" fill="#8b0000" />
        {/* Smoke Clouds */}
        <circle cx="210" cy="-45" r="15" fill="#f5f5f5" opacity="0.8" />
        <circle cx="225" cy="-55" r="20" fill="#f5f5f5" opacity="0.8" />
        <circle cx="200" cy="-65" r="18" fill="#f5f5f5" opacity="0.7" />
        <circle cx="250" cy="-25" r="12" fill="#f5f5f5" opacity="0.8" />
        <circle cx="265" cy="-35" r="16" fill="#f5f5f5" opacity="0.8" />
      </g>
      {/* Cargo Crane */}
      <g transform="translate(900, 100)">
        <rect x="40" y="50" width="10" height="150" fill="#ffa500" />
        <rect x="-20" y="50" width="100" height="10" fill="#ffa500" />
        <line x1="45" y1="60" x2="0" y2="100" stroke="#ff8c00" strokeWidth="4" />
        <line x1="45" y1="60" x2="80" y2="100" stroke="#ff8c00" strokeWidth="4" />
        <line x1="10" y1="60" x2="10" y2="120" stroke="#333" strokeWidth="2" />
        <rect x="0" y="120" width="20" height="20" fill="#8b4513" /> {/* Hanging crate */}
      </g>
    </svg>
  );
}
function GoodsMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      <path d="M0,400 L0,290 L1200,290 L1200,400 Z" fill="#a9a9a9" />

      {/* Supermarket / Storefront */}
      <g transform="translate(50, 170)">
        <rect x="0" y="0" width="240" height="120" fill="#ffefd5" />
        <rect x="-10" y="-10" width="260" height="20" fill="#ff4500" /> {/* Awning roof */}
        {/* Striped Awning */}
        <polygon points="-10,10 0,30 10,10" fill="#ff4500" />
        <polygon points="10,10 20,30 30,10" fill="#fff" />
        <polygon points="30,10 40,30 50,10" fill="#ff4500" />
        <polygon points="50,10 60,30 70,10" fill="#fff" />
        <polygon points="70,10 80,30 90,10" fill="#ff4500" />
        <polygon points="90,10 100,30 110,10" fill="#fff" />
        <polygon points="110,10 120,30 130,10" fill="#ff4500" />
        <polygon points="130,10 140,30 150,10" fill="#fff" />
        <polygon points="150,10 160,30 170,10" fill="#ff4500" />
        <polygon points="170,10 180,30 190,10" fill="#fff" />
        <polygon points="190,10 200,30 210,10" fill="#ff4500" />
        <polygon points="210,10 220,30 230,10" fill="#fff" />
        <polygon points="230,10 240,30 250,10" fill="#ff4500" />
        
        {/* Large Windows */}
        <rect x="20" y="40" width="80" height="60" fill="#87ceeb" opacity="0.6" />
        <rect x="140" y="40" width="80" height="60" fill="#87ceeb" opacity="0.6" />
        <text x="65" y="75" fontSize="20" fill="#fff" fontWeight="bold">SALE</text>
      </g>

      {/* Wooden Crates Stack */}
      <g transform="translate(350, 200)">
        {/* Bottom row */}
        <rect x="0" y="50" width="40" height="40" fill="#cd853f" stroke="#8b4513" strokeWidth="2" />
        <line x1="0" y1="50" x2="40" y2="90" stroke="#8b4513" strokeWidth="2" />
        <line x1="40" y1="50" x2="0" y2="90" stroke="#8b4513" strokeWidth="2" />
        
        <rect x="45" y="50" width="40" height="40" fill="#cd853f" stroke="#8b4513" strokeWidth="2" />
        <line x1="45" y1="50" x2="85" y2="90" stroke="#8b4513" strokeWidth="2" />
        <line x1="85" y1="50" x2="45" y2="90" stroke="#8b4513" strokeWidth="2" />
        
        {/* Top row */}
        <rect x="22" y="10" width="40" height="40" fill="#cd853f" stroke="#8b4513" strokeWidth="2" />
        <line x1="22" y1="10" x2="62" y2="50" stroke="#8b4513" strokeWidth="2" />
        <line x1="62" y1="10" x2="22" y2="50" stroke="#8b4513" strokeWidth="2" />
      </g>

      {/* Detailed Delivery Truck */}
      <g transform="translate(600, 160)">
        {/* Trailer */}
        <rect x="0" y="20" width="200" height="100" rx="4" fill="#ffffff" stroke="#ccc" strokeWidth="2" />
        <rect x="0" y="90" width="200" height="10" fill="#ff4500" /> {/* Red stripe */}
        <text x="30" y="70" fontSize="32" fill="#333" fontWeight="bold" fontStyle="italic">EXPRESS</text>
        
        {/* Cab */}
        <rect x="205" y="50" width="70" height="70" rx="8" fill="#1e90ff" />
        <rect x="210" y="55" width="40" height="30" rx="4" fill="#add8e6" />
        <rect x="200" y="80" width="15" height="40" fill="#333" /> {/* Exhaust stack */}
        
        {/* Wheels */}
        <circle cx="40" cy="120" r="18" fill="#333" />
        <circle cx="40" cy="120" r="8" fill="#ccc" />
        <circle cx="80" cy="120" r="18" fill="#333" />
        <circle cx="80" cy="120" r="8" fill="#ccc" />
        
        <circle cx="230" cy="120" r="18" fill="#333" />
        <circle cx="230" cy="120" r="8" fill="#ccc" />
      </g>
    </svg>
  );
}

/* ===================== Ch 6: WASTE ===================== */
function WasteFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Landfill mounds in murky green/brown */}
      <path d="M0,400 L0,210 Q80,180 160,220 Q220,190 300,230 Q380,170 460,210 Q540,185 620,225 Q700,195 780,215 Q860,180 940,210 Q1020,190 1100,220 L1200,200 L1200,400 Z" fill="#8b4513" opacity="0.6" />
      <path d="M0,400 L0,240 Q150,200 300,250 T600,230 T900,260 L1200,230 L1200,400 Z" fill="#556b2f" opacity="0.7" />
      
      {/* Distant Bulldozer silhouette */}
      <g transform="translate(700, 185)" opacity="0.5">
        <rect x="10" y="10" width="30" height="20" fill="#222" />
        <rect x="0" y="20" width="15" height="15" fill="#222" />
        <path d="M-10,35 L0,25 L5,35 Z" fill="#222" /> {/* Blade */}
        <rect x="5" y="30" width="40" height="10" rx="4" fill="#111" /> {/* Tracks */}
      </g>
    </svg>
  );
}
function WasteMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* Concrete ground */}
      <path d="M0,400 L0,290 L1200,290 L1200,400 Z" fill="#a9a9a9" />

      {/* Garbage Truck (Detailed) */}
      <g transform="translate(50, 150)">
        <rect x="0" y="40" width="160" height="90" rx="8" fill="#2e8b57" /> {/* Compactor body */}
        <path d="M160,40 L190,40 L210,80 L210,130 L160,130 Z" fill="#ffffff" stroke="#ccc" strokeWidth="2" /> {/* Cab */}
        <polygon points="165,45 185,45 200,75 165,75" fill="#87ceeb" /> {/* Window */}
        <rect x="0" y="40" width="20" height="90" fill="#556b2f" /> {/* Back loader part */}
        
        {/* Wheels */}
        <circle cx="40" cy="130" r="22" fill="#333" />
        <circle cx="40" cy="130" r="10" fill="#ccc" />
        <circle cx="90" cy="130" r="22" fill="#333" />
        <circle cx="90" cy="130" r="10" fill="#ccc" />
        <circle cx="180" cy="130" r="22" fill="#333" />
        <circle cx="180" cy="130" r="10" fill="#ccc" />
      </g>

      {/* Row of Recycling Bins */}
      <g transform="translate(450, 190)">
        {/* Paper (Blue) */}
        <rect x="0" y="20" width="50" height="70" rx="4" fill="#4169e1" />
        <rect x="-5" y="15" width="60" height="8" rx="2" fill="#27408b" />
        <circle cx="15" cy="90" r="6" fill="#222" />
        <circle cx="35" cy="90" r="6" fill="#222" />
        <text x="17" y="55" fill="#fff" fontSize="24" fontWeight="bold">♻</text>
        
        {/* Glass (Green) */}
        <rect x="80" y="20" width="50" height="70" rx="4" fill="#32cd32" />
        <rect x="75" y="15" width="60" height="8" rx="2" fill="#228b22" />
        <circle cx="95" cy="90" r="6" fill="#222" />
        <circle cx="115" cy="90" r="6" fill="#222" />
        <text x="97" y="55" fill="#fff" fontSize="24" fontWeight="bold">♻</text>

        {/* Plastic (Yellow) */}
        <rect x="160" y="20" width="50" height="70" rx="4" fill="#ffd700" />
        <path d="M155,15 L215,15 L215,5 L155,23 Z" fill="#daa520" /> {/* Open lid */}
        <circle cx="175" cy="90" r="6" fill="#222" />
        <circle cx="195" cy="90" r="6" fill="#222" />
        <text x="177" y="55" fill="#fff" fontSize="24" fontWeight="bold">♻</text>
      </g>

      {/* Trash Bags */}
      <g transform="translate(750, 240)">
        <path d="M20,50 Q0,50 0,30 Q0,10 15,15 Q20,0 25,15 Q40,10 40,30 Q40,50 20,50 Z" fill="#222" />
        <polygon points="15,15 25,15 20,5" fill="#222" />
        
        <path d="M60,50 Q40,50 40,30 Q40,10 55,15 Q60,0 65,15 Q80,10 80,30 Q80,50 60,50 Z" fill="#333" />
        <polygon points="55,15 65,15 60,5" fill="#333" />
      </g>

      {/* Large Green Dumpster */}
      <g transform="translate(900, 200)">
        <polygon points="0,20 120,20 110,80 10,80" fill="#006400" />
        <rect x="-5" y="10" width="130" height="10" fill="#004b00" />
        <rect x="15" y="30" width="90" height="40" fill="#004b00" opacity="0.4" />
        <rect x="10" y="80" width="10" height="10" fill="#222" />
        <rect x="100" y="80" width="10" height="10" fill="#222" />
      </g>
    </svg>
  );
}

/* ===================== Ch 7: DIGITAL ===================== */
function DigitalFar() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      {/* High-tech cityscape backdrop */}
      <rect x="0" y="150" width="1200" height="250" fill="#191970" />
      <g opacity="0.6">
        <rect x="50" y="100" width="80" height="200" fill="#000080" />
        <rect x="180" y="60" width="100" height="240" fill="#000080" />
        <rect x="350" y="120" width="120" height="180" fill="#000080" />
        <rect x="600" y="50" width="150" height="250" fill="#000080" />
        <rect x="850" y="90" width="110" height="210" fill="#000080" />
        <rect x="1000" y="130" width="90" height="170" fill="#000080" />
        
        {/* Glowing grid / windows */}
        <rect x="190" y="80" width="80" height="4" fill="#00ffff" />
        <rect x="190" y="100" width="80" height="4" fill="#00ffff" />
        <rect x="190" y="120" width="80" height="4" fill="#00ffff" />
        
        <rect x="620" y="70" width="4" height="150" fill="#00ffff" />
        <rect x="650" y="70" width="4" height="150" fill="#00ffff" />
        <rect x="680" y="70" width="4" height="150" fill="#00ffff" />
        <rect x="710" y="70" width="4" height="150" fill="#00ffff" />
      </g>
    </svg>
  );
}
function DigitalMid() {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
      <path d="M0,400 L0,320 L1200,320 L1200,400 Z" fill="#2f4f4f" />
      <path d="M0,320 L1200,320" stroke="#00ffff" strokeWidth="2" opacity="0.5" /> {/* Neon floor line */}

      {/* Massive Cell Tower */}
      <g transform="translate(150, 40)">
        <polygon points="30,20 50,20 70,280 10,280" fill="#a9a9a9" />
        <polygon points="20,280 40,20 60,280" fill="none" stroke="#696969" strokeWidth="4" />
        
        {/* Antenna Array */}
        <rect x="10" y="20" width="60" height="10" fill="#555" />
        <rect x="0" y="0" width="15" height="40" fill="#fff" rx="4" />
        <rect x="32" y="0" width="15" height="40" fill="#fff" rx="4" />
        <rect x="65" y="0" width="15" height="40" fill="#fff" rx="4" />
        <circle cx="40" cy="-15" r="8" fill="#ff0000" />
        
        {/* Microwave Drum Dishes */}
        <circle cx="10" cy="100" r="15" fill="#f8f8ff" stroke="#a9a9a9" strokeWidth="4" />
        <circle cx="70" cy="150" r="15" fill="#f8f8ff" stroke="#a9a9a9" strokeWidth="4" />
      </g>

      {/* Modern Data Center Building / Server Racks */}
      <g transform="translate(450, 160)">
        <rect x="0" y="0" width="280" height="160" fill="#1e1e1e" stroke="#333" strokeWidth="4" />
        
        {/* Rack 1 */}
        <rect x="20" y="20" width="60" height="120" fill="#2c2c2c" />
        <rect x="25" y="30" width="50" height="10" fill="#00ffff" />
        <rect x="25" y="50" width="50" height="10" fill="#00ffff" />
        <rect x="25" y="70" width="50" height="10" fill="#32cd32" />
        <rect x="25" y="90" width="50" height="10" fill="#00ffff" />
        <rect x="25" y="110" width="50" height="10" fill="#32cd32" />
        
        {/* Rack 2 */}
        <rect x="110" y="20" width="60" height="120" fill="#2c2c2c" />
        <rect x="115" y="30" width="50" height="10" fill="#32cd32" />
        <rect x="115" y="50" width="50" height="10" fill="#00ffff" />
        <rect x="115" y="70" width="50" height="10" fill="#ff00ff" />
        <rect x="115" y="90" width="50" height="10" fill="#00ffff" />
        <rect x="115" y="110" width="50" height="10" fill="#32cd32" />
        
        {/* Rack 3 */}
        <rect x="200" y="20" width="60" height="120" fill="#2c2c2c" />
        <rect x="205" y="30" width="50" height="10" fill="#00ffff" />
        <rect x="205" y="50" width="50" height="10" fill="#ff00ff" />
        <rect x="205" y="70" width="50" height="10" fill="#32cd32" />
        <rect x="205" y="90" width="50" height="10" fill="#00ffff" />
        <rect x="205" y="110" width="50" height="10" fill="#00ffff" />
      </g>

      {/* Satellite Dish receiving signal */}
      <g transform="translate(900, 200)">
        <polygon points="40,120 60,120 55,60 45,60" fill="#555" />
        <path d="M 0 60 Q 50 0 100 60" fill="none" stroke="#fff" strokeWidth="8" />
        <circle cx="50" cy="40" r="6" fill="#ff00ff" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="#aaa" strokeWidth="4" />
        
        {/* Wifi waves beaming up */}
        <path d="M 30 10 Q 50 -10 70 10" fill="none" stroke="#00ffff" strokeWidth="4" opacity="0.8" />
        <path d="M 20 -10 Q 50 -40 80 -10" fill="none" stroke="#00ffff" strokeWidth="4" opacity="0.6" />
        <path d="M 10 -30 Q 50 -70 90 -30" fill="none" stroke="#00ffff" strokeWidth="4" opacity="0.4" />
      </g>
    </svg>
  );
}

/* Helper Component for Trees */
function Tree({ cx, cy, scale = 1 }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <rect x="-3" y="0" width="6" height="25" fill="#8b4513" />
      <circle cx="0" cy="-5" r="12" fill="#228b22" />
      <circle cx="-10" cy="5" r="10" fill="#2e8b57" />
      <circle cx="10" cy="5" r="10" fill="#2e8b57" />
    </g>
  );
}
