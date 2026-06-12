"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from './MissionTracker.module.css';

const GOAL = 10000;

// Slim banner under the header: live count of verified detailed-report
// downloads against the 10,000 goal, plus the mission declaration.
// Reads via the get_public_stats() RPC so no personal data is exposed.
export default function MissionTracker({ hidden = false }) {
  const [verifiedReports, setVerifiedReports] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_public_stats');
        if (!mounted || error || !data) return;
        const n = Number(data.verified_reports);
        if (Number.isFinite(n)) setVerifiedReports(n);
      } catch (err) {
        // Stats are decorative — stay hidden if unavailable.
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 120000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // (after setup_public_access.sql is run).

  // The user requested 22 as a default if not yet fetched, but we use dynamic if available
  const displayCount = verifiedReports || 22;

  if (hidden) return null;

  return (
    <div className={styles.trackerTextOnly}>
      <span className={styles.trackerNumbers}>{displayCount.toLocaleString()} / {GOAL.toLocaleString()}</span>
      <span className={styles.trackerLabel}>
        <span className="lang-en">detailed reports downloaded</span>
        <span className="lang-np">विस्तृत रिपोर्ट डाउनलोड भए</span>
      </span>
    </div>
  );
}
