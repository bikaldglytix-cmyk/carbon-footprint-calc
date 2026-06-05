import React from 'react';
import styles from './ChapterTimeline.module.css';

const chapters = [
  { num: 1, name: { en: 'Geodemography', np: 'भूगोल' } },
  { num: 2, name: { en: 'Home & Energy', np: 'घर र ऊर्जा' } },
  { num: 3, name: { en: 'Transport', np: 'यातायात' } },
  { num: 4, name: { en: 'Food', np: 'खाना' } },
  { num: 5, name: { en: 'Consumption', np: 'सामान' } },
  { num: 6, name: { en: 'Waste', np: 'फोहोर' } },
  { num: 7, name: { en: 'Digital', np: 'डिजिटल' } },
];

export default function ChapterTimeline({ currentChapterNum }) {
  // Calculate progress width
  const totalSegments = chapters.length - 1;
  const currentSegment = Math.max(0, currentChapterNum - 1);
  const progressPercent = (currentSegment / totalSegments) * 100;

  const chapterColors = {
    1: 'var(--teal)',
    2: 'var(--saffron)',
    3: 'var(--sky)',
    4: '#2ecc71',
    5: 'var(--coral)',
    6: '#8e44ad',
    7: '#34495e'
  };
  const activeColor = chapterColors[currentChapterNum] || 'var(--teal)';

  return (
    <div className={styles.timelineWrapper} style={{ '--chapter-color': activeColor }}>
      <div className={styles.timeline}>
        <div className={styles.line}></div>
        <div 
          className={styles.progressLine} 
          style={{ height: `calc(${progressPercent}% - 20px)` }}
        ></div>
        
        {chapters.map((chapter) => {
          const isCompleted = chapter.num < currentChapterNum;
          const isActive = chapter.num === currentChapterNum;
          
          let nodeClass = styles.node;
          if (isCompleted) nodeClass += ` ${styles.completed}`;
          if (isActive) nodeClass += ` ${styles.active}`;

          return (
            <div key={chapter.num} className={nodeClass}>
              {isCompleted ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                chapter.num
              )}
              
              <div className={styles.tooltip}>
                <span className="lang-en">{chapter.name.en}</span>
                <span className="lang-np">{chapter.name.np}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
