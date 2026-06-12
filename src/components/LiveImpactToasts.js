"use client";
import React, { useState, useEffect } from 'react';
import { useRecentActivity } from '../hooks/useRecentActivity';
import styles from './LiveImpactToasts.module.css';

const KIND_META = {
  checkup: {
    en: (name, loc) => `${name}${loc ? ` from ${loc}` : ''} completed a check-up!`,
    np: (name, loc) => `${name}${loc ? ` (${loc})` : ''} ले जलवायु जाँच पूरा गर्नुभयो!`,
  },
  report: {
    en: (name, loc) => `${name}${loc ? ` from ${loc}` : ''} requested a detailed report!`,
    np: (name, loc) => `${name}${loc ? ` (${loc})` : ''} ले विस्तृत रिपोर्ट अनुरोध गर्नुभयो!`,
  },
  verified: {
    en: (name) => `${name} downloaded their detailed report!`,
    np: (name) => `${name} ले विस्तृत रिपोर्ट डाउनलोड गर्नुभयो!`,
  },
  support: {
    en: (name) => `${name} supported the mission!`,
    np: (name) => `${name} ले अभियानलाई सहयोग गर्नुभयो!`,
  },
};

export default function LiveImpactToasts() {
  const activities = useRecentActivity();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activities.length === 0) return;

    // Wait a few seconds before starting
    const startDelay = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(startDelay);
  }, [activities.length > 0]);

  useEffect(() => {
    if (activities.length === 0) return;

    const cycleInterval = setInterval(() => {
      setIsVisible(false); // Fade out

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true); // Fade back in
      }, 600); // Wait for fade out animation

    }, 8000); // Change toast every 8 seconds

    return () => clearInterval(cycleInterval);
  }, [activities.length]);

  if (activities.length === 0) return null;

  const activity = activities[currentIndex % activities.length];
  const meta = KIND_META[activity.kind] || KIND_META.checkup;

  return (
    <div className={styles.container}>
      <div className={`${styles.toast} ${isVisible ? styles.visible : ''}`}>
        <span>
          <span className="lang-en">{meta.en(activity.firstName, activity.location)}</span>
          <span className="lang-np">{meta.np(activity.firstName, activity.location)}</span>
        </span>
      </div>
    </div>
  );
}
