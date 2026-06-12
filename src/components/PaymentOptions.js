"use client";
import { useState, useEffect } from 'react';
import { asset } from '../lib/asset';

import styles from './PaymentOptions.module.css';

// Bank details for direct / international transfers. International donors use the SWIFT code.
export const BANK_DETAILS = [
  ['Account Name', 'Aptech Lab Pvt. Ltd.'],
  ['Bank Name', 'Sanima Bank Ltd'],
  ['Branch', 'Narayneshwor Marg, Kathmandu'],
  ['Account Number', '0770100100000800'],
  ['SWIFT Code', 'SNMANPKA'],
  ['Company PAN / VAT', '610410347'],
];

const MONO = new Set(['Account Number', 'SWIFT Code', 'Company PAN / VAT']);
const COPYABLE = new Set(['Account Name', 'Account Number', 'SWIFT Code']);

// Currencies offered per payment method. Fonepay is NPR-only; domestic bank
// transfers accept NPR/INR; international wires default to USD.
const CURRENCIES = {
  fonepay: ['NPR'],
  bank: ['NPR', 'INR'],
  international: ['USD', 'EUR', 'GBP', 'AUD', 'INR'],
};
const CURRENCY_LABELS = {
  NPR: 'NPR (रु)', INR: 'INR (₹)', USD: 'USD ($)', EUR: 'EUR (€)', GBP: 'GBP (£)', AUD: 'AUD (A$)',
};

const INTL_STEPS = [
  {
    en: 'Open your bank or a remittance service you trust (Wise, Remitly, Western Union, or a regular bank wire).',
    np: 'तपाईंको बैंक वा भरपर्दो रेमिट्यान्स सेवा खोल्नुहोस् (Wise, Remitly, Western Union वा बैंक वायर)।',
  },
  {
    en: 'Send your contribution to the account below — the SWIFT code SNMANPKA routes it to us from any country.',
    np: 'तलको खातामा रकम पठाउनुहोस् — SWIFT कोड SNMANPKA ले जुनसुकै देशबाट हामीसम्म पुर्‍याउँछ।',
  },
  {
    en: 'Pick the currency you sent and the amount. Your bank converts it to NPR automatically.',
    np: 'पठाएको मुद्रा र रकम छान्नुहोस्। तपाईंको बैंकले स्वतः NPR मा रूपान्तरण गर्छ।',
  },
  {
    en: 'Tell us the account holder name you sent from, so we can match your transfer and confirm by email.',
    np: 'कुन खाताबाट पठाउनुभयो, सो खातावालाको नाम लेख्नुहोस् — हामी तपाईंको ट्रान्सफर भिडाएर इमेलबाट पुष्टि गर्छौं।',
  },
];

// Shared payment selector used by every payment/donation flow.
export default function PaymentOptions({ 
  method, setMethod, 
  currency, setCurrency, 
  amount, setAmount, 
  accountName, setAccountName,
  fixedAmounts = null,
  viewMode = 'full', // 'methods', 'details', 'full'
  onMethodSelect = () => {}
}) {
  const [copied, setCopied] = useState(null);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (fixedAmounts && setAmount) {
      setAmount(fixedAmounts[currency] || '');
    }
  }, [currency, fixedAmounts, setAmount]);

  const pickMethod = (m) => {
    setMethod(m);
    setCurrency(CURRENCIES[m][0]);
    onMethodSelect(m);
  };

  const handleCopy = (label, value) => {
    try {
      navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) { /* clipboard unavailable — ignore */ }
  };

  const bankRows = (
    <div className={styles.bankDetails}>
      {BANK_DETAILS.map(([label, value]) => (
        <div key={label} className={styles.detailRow}>
          <span className={styles.detailLabel}>{label}</span>
          <span className={`${styles.detailValue} ${MONO.has(label) ? styles.mono : ''}`}>
            {value}
            {COPYABLE.has(label) && (
              <button
                type="button"
                onClick={() => handleCopy(label, value)}
                title="Copy"
                className={`${styles.copyBtn} ${copied === label ? styles.copied : ''}`}
              >
                {copied === label ? 'Copied' : 'Copy'}
              </button>
            )}
          </span>
        </div>
      ))}
    </div>
  );

  const amountRow = fixedAmounts ? (
    <div className={styles.fixedAmountRow}>
      <span className={styles.fixedAmountLabel}>
        <span className="lang-en">Total Due</span>
        <span className="lang-np">कुल रकम</span>
      </span>
      <div className={styles.fixedAmountWrapper}>
        <span className={styles.fixedAmountValue}>
          {CURRENCY_LABELS[currency] ? CURRENCY_LABELS[currency].replace(/\s*\(.*?\)\s*/, '') : currency} {fixedAmounts[currency]}
        </span>
        {CURRENCIES[method].length > 1 && (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={styles.ghostSelect}
          >
            {CURRENCIES[method].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  ) : (
    <div className={styles.inputRow}>
      <div style={{ flex: '0 0 120px' }}>
        <label className={styles.fieldLabel}>
          <span className="lang-en">Currency</span>
          <span className="lang-np">मुद्रा</span>
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          disabled={CURRENCIES[method].length === 1}
          className={styles.inputField}
        >
          {CURRENCIES[method].map((c) => (
            <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label className={styles.fieldLabel}>
          <span className="lang-en">Amount</span>
          <span className="lang-np">रकम</span>
        </label>
        <input
          type="number"
          min="1"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className={styles.inputField}
        />
      </div>
    </div>
  );

  const accountNameRow = setAccountName ? (
    <div className={styles.inputGroup}>
      <label className={styles.fieldLabel}>
        <span className="lang-en">Your Account Holder Name *</span>
        <span className="lang-np">तपाईंको खातावालाको नाम *</span>
      </label>
      <input
        type="text"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        placeholder="Name on the account you paid from"
        className={styles.inputField}
      />
      <p className={styles.helperText}>
        <span className="lang-en">We use this to match your transfer when verifying your payment.</span>
        <span className="lang-np">भुक्तानी प्रमाणित गर्दा तपाईंको ट्रान्सफर भिडाउन यो प्रयोग गरिन्छ।</span>
      </p>
    </div>
  ) : null;

  if (viewMode === 'methods') {
    return (
      <div className={styles.methodCardsContainer}>
        <button type="button" onClick={() => pickMethod('fonepay')} className={`${styles.methodCard} ${method === 'fonepay' ? styles.activeCard : ''}`}>
          <div className={styles.methodIcon}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/><rect x="7" y="11" width="10" height="2"/></svg>
          </div>
          <div className={styles.methodText}>
            <span className="lang-en">Fonepay / eSewa / Khalti</span>
            <span className="lang-np">फोनपे / इसेवा / खल्ती</span>
          </div>
        </button>

        <button type="button" onClick={() => pickMethod('bank')} className={`${styles.methodCard} ${method === 'bank' ? styles.activeCard : ''}`}>
          <div className={styles.methodIcon}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
          </div>
          <div className={styles.methodText}>
            <span className="lang-en">Bank Transfer (Nepal)</span>
            <span className="lang-np">बैंक ट्रान्सफर (नेपाल)</span>
          </div>
        </button>

        <button type="button" onClick={() => pickMethod('international')} className={`${styles.methodCard} ${method === 'international' ? styles.activeCard : ''}`}>
          <div className={styles.methodIcon}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div className={styles.methodText}>
            <span className="lang-en">International Transfer</span>
            <span className="lang-np">अन्तर्राष्ट्रिय ट्रान्सफर</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {viewMode === 'full' && (
        <div className={styles.tabs}>
          <button type="button" onClick={() => pickMethod('fonepay')} className={`${styles.tab} ${method === 'fonepay' ? styles.active : ''}`}>
            Fonepay
          </button>
          <button type="button" onClick={() => pickMethod('bank')} className={`${styles.tab} ${method === 'bank' ? styles.active : ''}`}>
            <span className="lang-en">Bank (Nepal)</span>
            <span className="lang-np">बैंक (नेपाल)</span>
          </button>
          <button type="button" onClick={() => pickMethod('international')} className={`${styles.tab} ${method === 'international' ? styles.active : ''}`}>
            <span className="lang-en">International</span>
            <span className="lang-np">अन्तर्राष्ट्रिय</span>
          </button>
        </div>
      )}

      {method === 'fonepay' && (
        <div className={`${styles.panel} ${styles.fonepayContainer}`}>
          <h4 className={styles.panelTitle}>
            <span className="lang-en">Scan with Fonepay</span>
            <span className="lang-np">Fonepay ले स्क्यान गर्नुहोस्</span>
          </h4>
          <img
            src={asset('/qr.png')}
            alt="Fonepay QR Code"
            onClick={() => setZoom(true)}
            className={styles.qrImage}
          />
          <p className={styles.qrCaption}>
            <span className="lang-en">Tap to zoom · Works with any Fonepay-enabled bank or wallet</span>
            <span className="lang-np">जुम गर्न थिच्नुहोस् · जुनसुकै Fonepay बैंक वा वालेटबाट तिर्न सकिन्छ</span>
          </p>
          <div style={{ width: '100%' }}>{amountRow}</div>
        </div>
      )}

      {method === 'bank' && (
        <div className={styles.panel}>
          <h4 className={styles.panelTitle}>
            <span className="lang-en">Bank Transfer (within Nepal)</span>
            <span className="lang-np">बैंक ट्रान्सफर (नेपाल भित्र)</span>
          </h4>
          {bankRows}
          {amountRow}
          {accountNameRow}
        </div>
      )}

      {method === 'international' && (
        <div className={styles.panel}>
          <h4 className={styles.panelTitle}>
            <span className="lang-en">Paying from outside Nepal?</span>
            <span className="lang-np">नेपाल बाहिरबाट तिर्दै हुनुहुन्छ?</span>
          </h4>
          <p className={styles.intlIntro}>
            <span className="lang-en">Send your contribution to the account below via your preferred bank or remittance service (like Wise or Remitly). The SWIFT code <strong>SNMANPKA</strong> routes it to us.</span>
            <span className="lang-np">तपाईंको बैंक वा रेमिट्यान्स (जस्तै Wise वा Remitly) बाट तलको खातामा रकम पठाउनुहोस्। SWIFT कोड <strong>SNMANPKA</strong> ले हामीसम्म पुर्‍याउँछ।</span>
          </p>

          <div className={styles.intlBankSection}>
            <span className={styles.fieldLabel}>
              <span className="lang-en">Receiving Account (SWIFT)</span>
              <span className="lang-np">प्राप्त गर्ने खाता (SWIFT)</span>
            </span>
            {bankRows}
            <p className={styles.helperText}>
              <span className="lang-en">Bank address: Sanima Bank Ltd, Narayneshwor Marg, Kathmandu, Nepal. Please add your full name in the transfer reference/remarks.</span>
              <span className="lang-np">बैंक ठेगाना: सानिमा बैंक लि., नारायणेश्वर मार्ग, काठमाडौं, नेपाल। ट्रान्सफरको रिफरेन्स/रिमार्क्समा आफ्नो पूरा नाम लेख्नुहोस्।</span>
            </p>
          </div>

          {amountRow}
          {accountNameRow}
        </div>
      )}

      {zoom && (
        <div className={styles.zoomOverlay} onClick={() => setZoom(false)}>
          <img
            src={asset('/qr.png')}
            alt="QR Code zoomed"
            onClick={(e) => e.stopPropagation()}
            className={styles.zoomImage}
          />
        </div>
      )}
    </div>
  );
}
