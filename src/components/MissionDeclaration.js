"use client";
import styles from './MissionDeclaration.module.css';

// The mission statement on the home screen — a quiet typographic banner
// between the header and the beaver stage, no box, just type and hairlines.
export default function MissionDeclaration() {
  return (
    <div className={styles.declaration}>
      <span className={styles.eyebrow}>
        <span className="lang-en">Our Mission</span>
        <span className="lang-np">हाम्रो लक्ष्य</span>
      </span>
      <p className={styles.statement}>
        <span className="lang-en">Make 10,000 Nepalis climate conscious by 2027</span>
        <span className="lang-np">सन् २०२७ सम्म १०,००० नेपालीलाई जलवायु-सचेत बनाउने</span>
      </p>
      <div className={styles.rule}>
        <span className={styles.ruleLine}></span>
        <svg className={styles.ruleLeaf} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" />
          <path d="M12 22V12" />
        </svg>
        <span className={styles.ruleLine}></span>
      </div>
      <div className={styles.footerCredits}>
        <div className="lang-en">
          <div>Nepal's first Climate Checkup Tool.</div>
          <div>Developed by Appropriate Technology Labs.</div>
          <div>Version 1.0.1</div>
        </div>
        <div className="lang-np">
          <div>नेपालको पहिलो जलवायु जाँच उपकरण।</div>
          <div>एप्रोप्रिएट टेक्नोलोजी ल्याब्स द्वारा विकसित।</div>
          <div>संस्करण १.०.१</div>
        </div>
      </div>
    </div>
  );
}
