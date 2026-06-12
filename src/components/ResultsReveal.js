"use client";
import { useState, useEffect } from 'react';
import styles from './ResultsReveal.module.css';
import DetailedReport from './DetailedReport';
import PaymentOptions from './PaymentOptions';
import { supabase } from '../lib/supabase';

export default function ResultsReveal({ open, close, total, parts, userName, userLoc, userEmail, answers, submissionId, onOpenHelp, onRetake }) {
  const [showPledge, setShowPledge] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('fonepay');
  const [currency, setCurrency] = useState('NPR');
  const [payAmount, setPayAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [paymentStep, setPaymentStep] = useState(1);

  // Bank and international transfers need the payer's account holder name so
  // the team can match the incoming transfer during verification.
  const needsAccountName = paymentMethod !== 'fonepay';

  if (!open) return null;

  const fallbackName = userName || "Traveler";
  const fallbackLoc = userLoc || "Earth";
  const fallbackEmail = userEmail || "";
  
  // Math for trees: total is in tonnes. 1 tonne = 1000 kg. 25kg per tree.
  const treesToPlant = Math.ceil((total || 0) * 1000 / 25);
  
  const isLow = total <= 0.5; // Nepal average threshold

  const handleShare = async () => {
    const text = `I pledged to plant ${treesToPlant} trees to offset my ${total.toFixed(2)} tonnes of CO2e/yr impact! Join me in protecting our shared home.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Climate Pledge',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Pledge text copied to clipboard!');
    }
  };

  const handleClose = () => {
    setShowPledge(false);
    setShowPremium(false);
    setHasPaid(false);
    setPaymentStep(1);
    close();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const paymentFields = {
        name: fallbackName,
        email: fallbackEmail,
        phone: phone,
        payment_method: paymentMethod,
        payment_status: 'pending',
        // The report costs Rs 200; only NPR payments may default to it —
        // foreign-currency payers state the amount they actually sent.
        amount: payAmount ? parseFloat(payAmount) : (currency === 'NPR' ? 200 : 0),
        currency: currency,
        account_name: needsAccountName ? accountName.trim() : null
      };

      // If the account_name column hasn't been migrated yet, retry without it
      // so report requests never fail outright.
      const stripMissingColumn = (fields, error) =>
        error && /account_name/i.test(error.message || '')
          ? (({ account_name, ...rest }) => rest)(fields)
          : null;

      if (submissionId) {
        let { error } = await supabase
          .from('calculator_submissions')
          .update(paymentFields)
          .eq('id', submissionId);
        const retryFields = stripMissingColumn(paymentFields, error);
        if (retryFields) {
          ({ error } = await supabase
            .from('calculator_submissions')
            .update(retryFields)
            .eq('id', submissionId));
        }
        if (error) throw error;
      } else {
        const fullRow = {
          ...paymentFields,
          location: fallbackLoc,
          total_emissions: total,
          breakdown_home: parts.home,
          breakdown_transport: parts.transport,
          breakdown_food: parts.food,
          breakdown_goods: parts.goods,
          answers_data: answers
        };
        let { error } = await supabase
          .from('calculator_submissions')
          .insert([fullRow]);
        const retryRow = stripMissingColumn(fullRow, error);
        if (retryRow) {
          ({ error } = await supabase
            .from('calculator_submissions')
            .insert([retryRow]));
        }
        if (error) throw error;
      }
      setHasPaid(true);
    } catch (error) {
      console.error('Error saving submission:', error);
      alert('There was a problem submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={handleClose}></div>
      <div className={styles.content}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        
        <div className={styles.postcard}>
          {hasPaid ? (
             <div className={styles.thankYouView}>
                <div className={styles.pcHeader}>
                  <span className="lang-en">Request Received</span>
                  <span className="lang-np">अनुरोध प्राप्त भयो</span>
                </div>
                
                <div className={styles.thankYouIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                
                <div className={styles.thankYouText}>
                  <h3 className="lang-en">Thank You, {fallbackName}!</h3>
                  <h3 className="lang-np">धन्यवाद, {fallbackName}!</h3>
                  
                  <p className="lang-en">
                    Your payment request has been securely processed. Our team is now generating your granular footprint analysis.
                  </p>
                  <p className="lang-np">
                    तपाईंको भुक्तानी अनुरोध सुरक्षित रूपमा प्रशोधन गरिएको छ। हाम्रो टोलीले अब तपाईंको विस्तृत फुटप्रिन्ट विश्लेषण तयार गर्दैछ।
                  </p>
                  
                  <p className="lang-en">
                    We will send the complete report to <strong>{fallbackEmail}</strong> within 24 hours. Welcome to the ATL Community!
                  </p>
                  <p className="lang-np">
                    हामी २४ घण्टा भित्र <strong>{fallbackEmail}</strong> मा पूर्ण रिपोर्ट पठाउनेछौं। ATL समुदायमा स्वागत छ!
                  </p>
                </div>
                
                <button className={styles.pledgeBtn} onClick={handleClose} style={{marginTop: '32px'}}>
                  <span className="lang-en">Return to Calculator</span>
                  <span className="lang-np">क्याल्कुलेटरमा फर्कनुहोस्</span>
                </button>
             </div>
          ) : showPremium ? (
             <div className={styles.premiumView}>
                <div className={styles.pcHeader}>
                  <span className="lang-en">Detailed Analysis Request</span>
                  <span className="lang-np">विस्तृत विश्लेषण अनुरोध</span>
                </div>
                
                <div className={styles.premiumIntro}>
                  <p className="lang-en">
                    Unlock a comprehensive, granular breakdown of your footprint. Within 24 hours, you will receive a personalized action plan to minimize your impact, alongside priority access to ATL community events.
                  </p>
                  <p className="lang-np">
                    तपाईंको फुटप्रिन्टको विस्तृत विवरण प्राप्त गर्नुहोस्। २४ घण्टा भित्र, तपाईंले आफ्नो प्रभाव कम गर्न व्यक्तिगत योजना र ATL समुदायका कार्यक्रमहरूमा प्राथमिकता प्राप्त गर्नुहुनेछ।
                  </p>
                </div>

                <div className={styles.premiumBody}>
                  {paymentStep === 1 && (
                    <div className={styles.stepContainer}>
                      <p className={styles.qrLabel}>
                        <span className="lang-en">How would you like to pay?</span>
                        <span className="lang-np">कसरी भुक्तानी गर्नुहुन्छ?</span>
                      </p>
                      <PaymentOptions
                        method={paymentMethod}
                        setMethod={setPaymentMethod}
                        currency={currency}
                        setCurrency={setCurrency}
                        amount={payAmount}
                        setAmount={setPayAmount}
                        accountName={accountName}
                        setAccountName={setAccountName}
                        fixedAmounts={{ NPR: 200, INR: 125, USD: 2, GBP: 2, EUR: 2, AUD: 2 }}
                        viewMode="methods"
                        onMethodSelect={() => setPaymentStep(2)}
                      />
                    </div>
                  )}

                  {paymentStep === 2 && (
                    <div className={styles.stepContainer}>
                      <PaymentOptions
                        method={paymentMethod}
                        setMethod={setPaymentMethod}
                        currency={currency}
                        setCurrency={setCurrency}
                        amount={payAmount}
                        setAmount={setPayAmount}
                        accountName={accountName}
                        setAccountName={setAccountName}
                        fixedAmounts={{ NPR: 200, INR: 125, USD: 2, GBP: 2, EUR: 2, AUD: 2 }}
                        viewMode="details"
                      />
                      <button
                        type="button"
                        onClick={() => setPaymentStep(3)}
                        className={styles.submitPaymentBtn}
                        style={{ marginTop: '20px' }}
                      >
                        <span className="lang-en">I have made the payment &rarr;</span>
                        <span className="lang-np">मैले भुक्तानी गरिसकें &rarr;</span>
                      </button>
                      <button type="button" onClick={() => setPaymentStep(1)} className={styles.backLinkBtn}>
                        <span className="lang-en">&larr; Change payment method</span>
                        <span className="lang-np">&larr; भुक्तानी विधि परिवर्तन गर्नुहोस्</span>
                      </button>
                    </div>
                  )}

                  {paymentStep === 3 && (
                    <div className={styles.stepContainer}>
                      <form onSubmit={handlePaymentSubmit} className={styles.premiumForm}>
                        <div className={styles.requestingForLabel}>
                          <span className="lang-en">Requesting report for: <strong>{fallbackName}</strong>{fallbackEmail && ` (${fallbackEmail})`}</span>
                          <span className="lang-np"><strong>{fallbackName}</strong>{fallbackEmail && ` (${fallbackEmail})`} को लागि रिपोर्ट अनुरोध गर्दै</span>
                        </div>

                        <div className={styles.inputGroup}>
                          <label>
                            <span className="lang-en">Phone Number</span>
                            <span className="lang-np">फोन नम्बर</span>
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number..."
                            required
                            className={styles.inputField}
                          />
                        </div>

                        {needsAccountName && (
                          <div className={styles.inputGroup}>
                            <label>
                              <span className="lang-en">Account Holder Name</span>
                              <span className="lang-np">खातावालाको नाम</span>
                            </label>
                            <input
                              type="text"
                              value={accountName}
                              onChange={(e) => setAccountName(e.target.value)}
                              placeholder="Name on the account you paid from"
                              required
                              className={styles.inputField}
                            />
                          </div>
                        )}

                        <div className={styles.checkboxGroup}>
                          <input
                            type="checkbox"
                            id="paymentConfirm"
                            checked={paymentConfirmed}
                            onChange={(e) => setPaymentConfirmed(e.target.checked)}
                          />
                          <label htmlFor="paymentConfirm">
                            <span className="lang-en">I confirm that I have paid the amount due using the {paymentMethod === 'bank' ? 'bank details' : paymentMethod === 'international' ? 'international transfer details' : 'Fonepay QR'} shown.</span>
                            <span className="lang-np">म प्रमाणित गर्छु कि मैले {paymentMethod === 'bank' ? 'बैंक विवरण' : paymentMethod === 'international' ? 'अन्तर्राष्ट्रिय ट्रान्सफर विवरण' : 'फोनपे QR'} प्रयोग गरेर भुक्तानी गरेको छु।</span>
                          </label>
                        </div>

                        <button type="submit" className={styles.submitPaymentBtn} disabled={!phone.trim() || !paymentConfirmed || (needsAccountName && !accountName.trim()) || isSubmitting}>
                          <span className="lang-en">{isSubmitting ? 'Processing...' : 'Confirm & Request Report'}</span>
                          <span className="lang-np">{isSubmitting ? 'प्रशोधन गरिँदै...' : 'पुष्टि गर्नुहोस् र रिपोर्ट अनुरोध गर्नुहोस्'}</span>
                        </button>

                        <button type="button" onClick={() => setPaymentStep(2)} className={styles.backLinkBtn}>
                          <span className="lang-en">&larr; Back to payment details</span>
                          <span className="lang-np">&larr; भुक्तानी विवरणमा फर्कनुहोस्</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
             </div>
          ) : showPledge ? (
             <div className={styles.pledgeView}>
                <div className={styles.pcHeader}>
                  <span className="lang-en">A Pledge for the Earth</span>
                  <span className="lang-np">पृथ्वीको लागि प्रतिज्ञा</span>
                </div>
                
                <div className={styles.pledgeText}>
                  <p className="lang-en">
                    "I, <strong>{fallbackName}</strong> from <strong>{fallbackLoc}</strong>, have walked this path and seen the footprint I leave behind. My current impact is <strong>{total.toFixed(2)} tonnes CO₂e / yr</strong>. I pledge to plant <strong>{treesToPlant} trees</strong>, to tread lighter, to respect the mountains, and to protect our shared home."
                  </p>
                  <p className="lang-np">
                    "म, <strong>{fallbackLoc}</strong> को <strong>{fallbackName}</strong>, यो बाटो हिँडेको छु र मेरो फुटप्रिन्ट देखेको छु। मेरो हालको प्रभाव <strong>{total.toFixed(2)} टन CO₂e / वर्ष</strong> छ। म <strong>{treesToPlant} रुख</strong> रोप्न, कम फुटप्रिन्ट छोड्न, हिमालको सम्मान गर्न र हाम्रो साझा घरको रक्षा गर्न प्रतिज्ञा गर्दछु।"
                  </p>
                </div>
                
                <div className={styles.breakdown}>
                  <div className={styles.part}>
                    <span className={styles.pLabel}><span className="lang-en">Home</span><span className="lang-np">घर</span></span>
                    <div className={styles.pBar}><div style={{width: `${Math.min(100, (parts.home/total)*100)}%`, background: 'var(--coral)'}}></div></div>
                  </div>
                  <div className={styles.part}>
                    <span className={styles.pLabel}><span className="lang-en">Transport</span><span className="lang-np">यातायात</span></span>
                    <div className={styles.pBar}><div style={{width: `${Math.min(100, (parts.transport/total)*100)}%`, background: 'var(--sky)'}}></div></div>
                  </div>
                  <div className={styles.part}>
                    <span className={styles.pLabel}><span className="lang-en">Food</span><span className="lang-np">खाना</span></span>
                    <div className={styles.pBar}><div style={{width: `${Math.min(100, (parts.food/total)*100)}%`, background: 'var(--saffron)'}}></div></div>
                  </div>
                  <div className={styles.part}>
                    <span className={styles.pLabel}><span className="lang-en">Consumption</span><span className="lang-np">सामान</span></span>
                    <div className={styles.pBar}><div style={{width: `${Math.min(100, (parts.goods/total)*100)}%`, background: 'var(--teal)'}}></div></div>
                  </div>
                </div>
                
                <div className={styles.signatureArea}>
                  <div className={styles.signatureLine}>
                    <span className={styles.signName}>{fallbackName}</span>
                  </div>
                  <div className={styles.signDate}>{new Date().toLocaleDateString()}</div>
                </div>

                 <div className={styles.shareRow}>
                   <button className={styles.shareBtn} onClick={handleShare}>
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                     <span className="lang-en">Share Pledge</span>
                     <span className="lang-np">सेयर गर्नुहोस्</span>
                   </button>
                 </div>
              </div>
          ) : (
             <div className={styles.summaryView}>
                <div className={styles.pcHeader}>
                  <span className="lang-en">Your Footprint Summary</span>
                  <span className="lang-np">तपाईंको प्रभाव सारांश</span>
                </div>
                
                <div className={styles.bigTotal}>
                  {total.toFixed(2)} <span>tonnes CO₂e / yr</span>
                </div>

                {isLow ? (
                  <div className={styles.feedbackBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${styles.feedbackIcon} ${styles.good}`}>
                      <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" />
                      <path d="M12 22V12" />
                    </svg>
                    <h3 className={styles.feedbackTitle}>
                       <span className="lang-en">Light Step</span>
                       <span className="lang-np">हल्का पाइला</span>
                    </h3>
                    <p className={styles.feedbackText}>
                       <span className="lang-en">Your footprint is wonderfully low. Thank you for treading lightly.</span>
                       <span className="lang-np">तपाईंको कार्बन फुटप्रिन्ट धेरै कम छ। हल्का पाइला चाल्नुभएकोमा धन्यवाद।</span>
                    </p>
                  </div>
                ) : (
                  <div className={styles.feedbackBox}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${styles.feedbackIcon} ${styles.bad}`}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h3 className={styles.feedbackTitle}>
                       <span className="lang-en">Room to Improve</span>
                       <span className="lang-np">सुधारको सम्भावना</span>
                    </h3>
                    <p className={styles.feedbackText}>
                       <span className="lang-en">Your footprint is higher than the average. View your detailed report below to discover how you can reduce your impact.</span>
                       <span className="lang-np">तपाईंको कार्बन फुटप्रिन्ट औसत भन्दा बढी छ। आफ्नो प्रभाव कसरी कम गर्ने भनेर जान्न तलको विस्तृत रिपोर्ट हेर्नुहोस्।</span>
                    </p>
                  </div>
                )}

                <div className={styles.btnGroup}>
                  <button className={styles.pledgeBtn} onClick={onOpenHelp}>
                    <span className="lang-en">Help the Cause</span>
                    <span className="lang-np">अभियानलाई सहयोग गर्नुहोस्</span>
                  </button>
                  <button className={styles.premiumBtn} onClick={() => setShowPremium(true)}>
                    <span className="lang-en">View Detailed Report</span>
                    <span className="lang-np">विस्तृत रिपोर्ट हेर्नुहोस्</span>
                  </button>
                </div>

                {onRetake && (
                  <button className={styles.retakeLink} onClick={onRetake}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    <span className="lang-en">Retake the Check-Up</span>
                    <span className="lang-np">पुनः जाँच गर्नुहोस्</span>
                  </button>
                )}
             </div>
          )}
        </div>

        <div className={styles.prayerFlags}>
          <div className={styles.flag} style={{background: '#0F6E56'}}><span className="lang-en">Earth</span><span className="lang-np">पृथ्वी</span></div>
          <div className={styles.flag} style={{background: '#BA7517'}}><span className="lang-en">Water</span><span className="lang-np">जल</span></div>
          <div className={styles.flag} style={{background: '#D85A30'}}><span className="lang-en">Fire</span><span className="lang-np">अग्नि</span></div>
          <div className={styles.flag} style={{background: '#FAF7F0', color: '#2C2C2A'}}><span className="lang-en">Air</span><span className="lang-np">वायु</span></div>
          <div className={styles.flag} style={{background: '#185FA5'}}><span className="lang-en">Space</span><span className="lang-np">आकाश</span></div>
        </div>
      </div>
    </div>
  );
}
