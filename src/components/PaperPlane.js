"use client";
import React from 'react';
import styles from './PaperPlane.module.css';

export default function PaperPlane({ onClick }) {
  return (
    <button className={styles.button} onClick={onClick} title="Help the Cause">
      <span className="lang-en">Help the Cause</span>
      <span className="lang-np">अभियानलाई सहयोग</span>
      <svg className={styles.icon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
      </svg>
    </button>
  );
}
