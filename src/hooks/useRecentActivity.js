import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Live activity feed for the toasts. Reads through the get_public_stats /
// get_recent_activity SECURITY DEFINER functions (see setup_public_access.sql)
// so the public site never sees emails, phones or amounts — only a first
// name, a coarse location and the kind of activity. Falls back to a direct
// table read for databases that haven't run the migration yet.
export function useRecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchActivities() {
      try {
        let rows = null;

        const { data, error } = await supabase.rpc('get_recent_activity');
        if (!error && Array.isArray(data)) {
          rows = data.map((row) => ({
            firstName: row.first_name || 'Someone',
            location: row.location || null,
            kind: row.kind || 'checkup',
            id: row.created_at,
          }));
        } else {
          // Legacy fallback: direct select (works only if RLS allows it).
          const { data: legacy, error: legacyError } = await supabase
            .from('calculator_submissions')
            .select('name, location, payment_status, created_at')
            .order('created_at', { ascending: false })
            .limit(15);
          if (!legacyError && Array.isArray(legacy)) {
            rows = legacy.map((row) => ({
              firstName: (row.name || 'Someone').split(' ')[0],
              location:
                row.location && row.location !== 'Earth' && row.location !== 'Donation/Support'
                  ? row.location
                  : null,
              kind:
                row.location === 'Donation/Support'
                  ? 'support'
                  : row.payment_status === 'verified'
                  ? 'verified'
                  : ['pending', 'paid', 'done'].includes(row.payment_status)
                  ? 'report'
                  : 'checkup',
              id: row.created_at,
            }));
          }
        }

        if (mounted && rows && rows.length > 0) setActivities(rows);
      } catch (err) {
        console.error('Failed to fetch recent activity', err);
      }
    }

    fetchActivities();
    // Keep the feed fresh while the tab stays open.
    const interval = setInterval(fetchActivities, 90000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return activities;
}
