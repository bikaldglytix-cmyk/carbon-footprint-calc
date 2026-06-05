"use client";
import styles from './DetailedReport.module.css';

export default function DetailedReport({ total, parts, userName, userLoc }) {
  const fallbackName = userName || "Traveler";
  
  // Calculate percentages
  const pHome = Math.min(100, (parts.home / total) * 100) || 0;
  const pTransport = Math.min(100, (parts.transport / total) * 100) || 0;
  const pFood = Math.min(100, (parts.food / total) * 100) || 0;
  const pGoods = Math.min(100, (parts.goods / total) * 100) || 0;

  // Generate dynamic tips based on highest emissions
  let topDomain = 'home';
  let maxP = pHome;
  if (pTransport > maxP) { topDomain = 'transport'; maxP = pTransport; }
  if (pFood > maxP) { topDomain = 'food'; maxP = pFood; }
  if (pGoods > maxP) { topDomain = 'goods'; maxP = pGoods; }

  const tips = [];
  if (topDomain === 'home') {
    tips.push("Your home energy use is your biggest factor. Consider switching to energy-efficient appliances or LED lighting.");
    tips.push("Ensure your home is properly insulated to reduce heating and cooling needs.");
  } else if (topDomain === 'transport') {
    tips.push("Transport forms the bulk of your emissions. Try incorporating public transit or carpooling into your weekly routine.");
    tips.push("For short distances, consider walking or cycling instead of using a vehicle.");
  } else if (topDomain === 'food') {
    tips.push("Your diet has a significant impact. Reducing red meat consumption even by 1-2 days a week can drastically lower your footprint.");
    tips.push("Try to buy local and seasonal produce to reduce transportation emissions of your food.");
  } else {
    tips.push("Your consumption of goods and services is high. Practice mindful purchasing and prioritize durable, sustainable goods.");
    tips.push("Consider repairing items instead of replacing them, and recycle whenever possible.");
  }
  tips.push("Offset the remainder of your emissions by planting trees or supporting local conservation efforts.");

  return (
    <div className={styles.reportContainer}>
      <div className={styles.certHeader}>
        <h2 className={styles.certTitle}>Detailed Impact Analysis</h2>
        <div className={styles.certSub}>Prepared for {fallbackName}</div>
        <div className={styles.memberBadge}>
          <span>🌟</span>
          <span>Official ATL Community Member</span>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Granular Breakdown</h3>
      <div className={styles.breakdownGrid}>
        <div className={styles.domainCard}>
          <div className={styles.domainHeader}>
            <span className={styles.domainName}>Home & Energy</span>
            <span className={styles.domainValue}>{parts.home.toFixed(2)}t</span>
          </div>
          <div className={styles.domainBar}><div style={{width: `${pHome}%`, background: 'var(--coral)'}}></div></div>
        </div>
        
        <div className={styles.domainCard}>
          <div className={styles.domainHeader}>
            <span className={styles.domainName}>Transport</span>
            <span className={styles.domainValue}>{parts.transport.toFixed(2)}t</span>
          </div>
          <div className={styles.domainBar}><div style={{width: `${pTransport}%`, background: 'var(--sky)'}}></div></div>
        </div>

        <div className={styles.domainCard}>
          <div className={styles.domainHeader}>
            <span className={styles.domainName}>Food & Diet</span>
            <span className={styles.domainValue}>{parts.food.toFixed(2)}t</span>
          </div>
          <div className={styles.domainBar}><div style={{width: `${pFood}%`, background: 'var(--saffron)'}}></div></div>
        </div>

        <div className={styles.domainCard}>
          <div className={styles.domainHeader}>
            <span className={styles.domainName}>Consumption & Services</span>
            <span className={styles.domainValue}>{parts.goods.toFixed(2)}t</span>
          </div>
          <div className={styles.domainBar}><div style={{width: `${pGoods}%`, background: 'var(--teal)'}}></div></div>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Ways to Minimize Your Impact</h3>
      <div className={styles.tipsSection}>
        <ul className={styles.tipsList}>
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
