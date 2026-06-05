"use client";
import { useState } from 'react';
import styles from './ProfileSetup.module.css';

export default function ProfileSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && loc.trim() && email.trim()) {
      onComplete(name.trim(), loc.trim(), email.trim());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className="lang-en">Before We Begin</h2>
          <h2 className="lang-np">सुरु गर्नु अघि</h2>
          <p className="lang-en">Who is walking this path?</p>
          <p className="lang-np">यो बाटो कसले हिँड्दै छ?</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              <span className="lang-en">First Name</span>
              <span className="lang-np">पहिलो नाम</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="..."
              required
              maxLength={30}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>
              <span className="lang-en">Email Address</span>
              <span className="lang-np">इमेल ठेगाना</span>
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="..."
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>
              <span className="lang-en">Where are you from? (City, Country)</span>
              <span className="lang-np">तपाईं कहाँबाट हुनुहुन्छ? (शहर, देश)</span>
            </label>
            <input 
              type="text" 
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="..."
              required
              maxLength={50}
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={!name.trim() || !loc.trim() || !email.trim()}>
            <span className="lang-en">Begin Journey</span>
            <span className="lang-np">यात्रा सुरु गर्नुहोस्</span>
          </button>
        </form>
      </div>
    </div>
  );
}
