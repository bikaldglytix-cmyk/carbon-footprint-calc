"use client";
import { useState } from 'react';
import styles from './ResultsReveal.module.css';
import PaymentOptions from './PaymentOptions';
import { supabase } from '../lib/supabase';

export default function HelpTheCause({ open, close, userName, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('fonepay');
  const [currency, setCurrency] = useState('NPR');
  const [accountName, setAccountName] = useState('');
  const [donationStep, setDonationStep] = useState(1);

  // Bank and international transfers need the payer's account holder name so
  // the team can match the incoming transfer during verification.
  const needsAccountName = paymentMethod !== 'fonepay';

  if (!open) return null;

  const handleClose = () => {
    setShowForm(false);
    setHasPaid(false);
    setCurrentSlide(0);
    setDonationStep(1);
    close();
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) return;

    setIsSubmitting(true);

    try {
      const supportRow = {
        name: name.trim() || "Supporter",
        email: email.trim(),
        phone: phone.trim(),
        amount: amount ? parseFloat(amount) : 0,
        payment_method: paymentMethod,
        payment_status: 'pending',
        currency: currency,
        account_name: needsAccountName ? accountName.trim() : null,
        location: "Donation/Support",
        total_emissions: 0,
        breakdown_home: 0,
        breakdown_transport: 0,
        breakdown_food: 0,
        breakdown_goods: 0
      };

      let { error } = await supabase
        .from('calculator_submissions')
        .insert([supportRow]);

      // If the account_name column hasn't been migrated yet, retry without it
      // so donations never fail outright.
      if (error && /account_name/i.test(error.message || '')) {
        const { account_name, ...rest } = supportRow;
        ({ error } = await supabase.from('calculator_submissions').insert([rest]));
      }

      if (error) throw error;
      setHasPaid(true);
    } catch (error) {
      console.error('Error saving support request:', error);
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <div className={styles.postcard}>
          {hasPaid ? (
            <div className={styles.thankYouView}>
              <div className={styles.pcHeader}>
                <span className="lang-en">Support Received</span>
                <span className="lang-np">सहयोग प्राप्त भयो</span>
              </div>

              <div className={styles.thankYouIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5" /></svg>
              </div>

              <div className={styles.thankYouText}>
                <h3 className="lang-en">Thank You, {name || "Supporter"}!</h3>
                <h3 className="lang-np">धन्यवाद, {name || "सहयोगी"}!</h3>

                <p className="lang-en">
                  Your contribution has been received. Your support empowers us to bring climate literacy to thousands of students across Nepal.
                </p>
                <p className="lang-np">
                  तपाईंको योगदान प्राप्त भएको छ। तपाईंको सहयोगले नेपालभरिका हजारौं विद्यार्थीहरूलाई जलवायु साक्षरता प्रदान गर्न हामीलाई सशक्त बनाउँछ।
                </p>

                <p className="lang-en">
                  Welcome to the ATL Community. Together, we are building a more climate-aware Nepal.
                </p>
                <p className="lang-np">
                  ATL समुदायमा स्वागत छ। हामी सँगै जलवायु-सचेत नेपाल निर्माण गर्दैछौं।
                </p>
              </div>

              <button className={styles.pledgeBtn} onClick={handleClose} style={{ marginTop: '32px' }}>
                <span className="lang-en">Return to App</span>
                <span className="lang-np">एपमा फर्कनुहोस्</span>
              </button>
            </div>
          ) : showForm ? (
            <div className={styles.premiumView}>
              <div className={styles.pcHeader} style={{ marginBottom: '16px' }}>
                <span className="lang-en">Support Our Mission</span>
                <span className="lang-np">हाम्रो अभियानलाई सहयोग गर्नुहोस्</span>
              </div>

              <div className={styles.premiumIntro}>
                <p className="lang-en" style={{ textAlign: 'center', margin: '0 0 24px 0', fontStyle: 'italic', color: '#000000', fontSize: '14px', fontWeight: '500' }}>
                  "Built by young changemakers. Powered by people like you."
                </p>
              </div>

              <div className={styles.premiumBody}>
                <form onSubmit={handleSupportSubmit} className={styles.premiumForm}>
                  {donationStep === 1 && (
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
                        amount={amount}
                        setAmount={setAmount}
                        accountName={accountName}
                        setAccountName={setAccountName}
                        viewMode="methods"
                        onMethodSelect={() => setDonationStep(2)}
                      />
                    </div>
                  )}

                  {donationStep === 2 && (
                    <div className={styles.stepContainer}>
                      <PaymentOptions
                        method={paymentMethod}
                        setMethod={setPaymentMethod}
                        currency={currency}
                        setCurrency={setCurrency}
                        amount={amount}
                        setAmount={setAmount}
                        accountName={accountName}
                        setAccountName={setAccountName}
                        viewMode="details"
                      />
                      <button
                        type="button"
                        onClick={() => setDonationStep(3)}
                        className={styles.submitPaymentBtn}
                        style={{ marginTop: '20px' }}
                      >
                        <span className="lang-en">I have made the payment &rarr;</span>
                        <span className="lang-np">मैले भुक्तानी गरिसकें &rarr;</span>
                      </button>
                      <button type="button" onClick={() => setDonationStep(1)} className={styles.backLinkBtn}>
                        <span className="lang-en">&larr; Change payment method</span>
                        <span className="lang-np">&larr; भुक्तानी विधि परिवर्तन गर्नुहोस्</span>
                      </button>
                    </div>
                  )}

                  {donationStep === 3 && (
                    <div className={styles.stepContainer}>
                      <div className={styles.formGrid}>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label>Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                          <label>Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email address"
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="e.g. 98XXXXXXXX"
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>
                          <span className="lang-en">Donation Amount</span>
                          <span className="lang-np">दान रकम</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="Amount"
                          required
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
                            onChange={e => setAccountName(e.target.value)}
                            placeholder="Name on the account you paid from"
                            required
                          />
                        </div>
                      )}

                      <button type="submit" className={styles.submitPaymentBtn} disabled={!phone.trim() || !name.trim() || !amount || (needsAccountName && !accountName.trim()) || isSubmitting}>
                        <span className="lang-en">{isSubmitting ? 'Processing...' : 'Confirm Support'}</span>
                        <span className="lang-np">{isSubmitting ? 'प्रशोधन गरिँदै...' : 'सहयोग पुष्टि गर्नुहोस्'}</span>
                      </button>

                      <button type="button" onClick={() => setDonationStep(2)} className={styles.backLinkBtn}>
                        <span className="lang-en">&larr; Back to payment details</span>
                        <span className="lang-np">&larr; भुक्तानी विवरणमा फर्कनुहोस्</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className={styles.storyView}>
              <div className={styles.pcHeader}>
                <span className="lang-en">Support Climate Literacy in Nepal</span>
                <span className="lang-np">नेपालमा जलवायु साक्षरतालाई सहयोग गर्नुहोस्</span>
              </div>

              <div className={styles.storyContent} style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {currentSlide === 0 && (
                  <div className="slider-slide" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <p className="lang-en">
                      This calculator was built pro-bono by a group of young Nepali changemakers who believe climate action begins with awareness.
                    </p>
                    <p className="lang-np">
                      यो क्याल्कुलेटर युवा नेपाली परिवर्तनकर्ताहरूको समूहद्वारा नि:शुल्क निर्माण गरिएको हो जसले जलवायु कार्य सचेतनाबाट सुरु हुन्छ भन्ने विश्वास गर्छन्।
                    </p>

                    <p className="lang-en">
                      Our goal was simple: Help Nepal transform from climate victims to climate innovators, problem-solvers, and changemakers by making climate change personal, understandable, and actionable for every Nepali.
                    </p>
                    <p className="lang-np">
                      हाम्रो लक्ष्य सरल थियो: जलवायु परिवर्तनलाई प्रत्येक नेपालीका लागि व्यक्तिगत, बुझ्न सकिने र कार्ययोग्य बनाएर नेपाललाई जलवायु पीडितबाट जलवायु नवप्रवर्तक, समस्या समाधानकर्ता र परिवर्तनकर्तामा रूपान्तरण गर्न मद्दत गर्ने।
                    </p>
                  </div>
                )}

                {currentSlide === 1 && (
                  <div className="slider-slide" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <p className="lang-en">
                      But this is only the beginning. We envision taking this Climate Check-Up to schools, colleges, communities, and youth across Nepal through climate literacy workshops, helping thousands of students understand their environmental impact and discover how they can become part of the solution.
                    </p>
                    <p className="lang-np">
                      तर यो सुरुवात मात्र हो। हामी यो जलवायु जाँचलाई नेपालभरिका विद्यालय, कलेज, समुदाय र युवाहरूमाझ जलवायु साक्षरता कार्यशालाहरूमार्फत लैजाने परिकल्पना गर्छौं।
                    </p>

                    <div className={styles.bulletPoints}>
                      <h4 className="lang-en">Your support helps us:</h4>
                      <h4 className="lang-np">तपाईंको सहयोगले हामीलाई मद्दत गर्छ:</h4>
                      <ul className="lang-en">
                        <li>Improve and maintain this free tool</li>
                        <li>Reach more schools and students across Nepal</li>
                        <li>Conduct climate literacy and awareness workshops</li>
                        <li>Create educational resources in simple and accessible language</li>
                        <li>Build a stronger environmental movement led by young people</li>
                      </ul>
                      <ul className="lang-np">
                        <li>यस नि:शुल्क उपकरणलाई सुधार र मर्मत गर्न</li>
                        <li>नेपालभरिका थप विद्यालय र विद्यार्थीहरूसम्म पुग्न</li>
                        <li>जलवायु साक्षरता र जनचेतनामूलक कार्यशालाहरू सञ्चालन गर्न</li>
                        <li>सरल र पहुँचयोग्य भाषामा शैक्षिक सामग्रीहरू निर्माण गर्न</li>
                        <li>युवाहरूको नेतृत्वमा बलियो वातावरणीय अभियान निर्माण गर्न</li>
                      </ul>
                    </div>
                  </div>
                )}

                {currentSlide === 2 && (
                  <div className="slider-slide" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <p className="lang-en">
                      If this tool helped you learn something new, consider supporting our mission. Every contribution—big or small—helps create a more climate-aware Nepal.
                    </p>
                    <p className="lang-np">
                      यदि यो उपकरणले तपाईंलाई केही नयाँ कुरा सिक्न मद्दत गर्यो भने, हाम्रो अभियानलाई सहयोग गर्ने विचार गर्नुहोस्। प्रत्येक योगदानले बढी जलवायु-सचेत नेपाल निर्माण गर्न मद्दत गर्छ।
                    </p>

                    <p className="lang-en" style={{ fontWeight: '600', marginTop: '16px' }}>
                      Support awareness. Support action. Support the next generation of climate leaders.
                    </p>
                    <p className="lang-np" style={{ fontWeight: '600', marginTop: '16px' }}>
                      सचेतनालाई सहयोग गर्नुहोस्। कार्यलाई सहयोग गर्नुहोस्। जलवायु नेताहरूको आगामी पुस्तालाई सहयोग गर्नुहोस्।
                    </p>

                    <p className="lang-en" style={{ fontStyle: 'italic', marginTop: '24px', color: '#6b7280', textAlign: 'center' }}>
                      "Built by young changemakers. Powered by people like you"
                    </p>
                    <p className="lang-np" style={{ fontStyle: 'italic', marginTop: '24px', color: '#6b7280', textAlign: 'center' }}>
                      "युवा परिवर्तनकर्ताहरूद्वारा निर्मित। तपाईंजस्ता मानिसहरूद्वारा संचालित।"
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                      background: currentSlide === idx ? 'var(--color-accent)' : 'rgba(0,0,0,0.15)',
                      transition: 'background 0.2s'
                    }}
                  />
                ))}
              </div>

              <div className={styles.pcFooter} style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' }}>
                {currentSlide < 2 ? (
                  <button className={styles.pledgeBtn} onClick={() => setCurrentSlide(prev => prev + 1)}>
                    <span className="lang-en">Next</span>
                    <span className="lang-np">अगाडि</span>
                  </button>
                ) : (
                  <button className={styles.pledgeBtn} onClick={() => setShowForm(true)}>
                    <span className="lang-en">Support Our Mission</span>
                    <span className="lang-np">हाम्रो अभियानलाई सहयोग गर्नुहोस्</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
