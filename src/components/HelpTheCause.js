"use client";
import { useState } from 'react';
import styles from './ResultsReveal.module.css';
import { supabase } from '../lib/supabase';

export default function HelpTheCause({ open, close, userName, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setShowForm(false);
    setHasPaid(false);
    setIsZoomed(false);
    close();
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('calculator_submissions')
        .insert([
          {
            name: name.trim() || "Supporter",
            email: email.trim(),
            phone: phone.trim(),
            location: "Donation/Support",
            total_emissions: 0,
            breakdown_home: 0,
            breakdown_transport: 0,
            breakdown_food: 0,
            breakdown_goods: 0
          }
        ]);
        
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
      {isZoomed && (
        <div className={styles.qrZoomOverlay} onClick={() => setIsZoomed(false)}>
          <img src="/qr.png" alt="eSewa QR Code" className={styles.qrZoomed} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      <div className={styles.backdrop} onClick={handleClose}></div>
      <div className={styles.content}>
        <button className={styles.closeBtn} onClick={handleClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        
        <div className={styles.postcard}>
          {hasPaid ? (
             <div className={styles.thankYouView}>
                <div className={styles.pcHeader}>
                  <span className="lang-en">Support Received</span>
                  <span className="lang-np">सहयोग प्राप्त भयो</span>
                </div>
                
                <div className={styles.thankYouIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
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
                
                <button className={styles.pledgeBtn} onClick={handleClose} style={{marginTop: '32px'}}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                        <label>Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          placeholder="Your name"
                          required
                          className={styles.activeInput} 
                        />
                      </div>
                      <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                        <label>Email</label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          placeholder="Email address"
                          className={styles.activeInput} 
                        />
                      </div>
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label>Phone Number (eSewa ID)</label>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        placeholder="Enter your phone number"
                        required
                        className={styles.activeInput}
                      />
                    </div>
                    
                    <div className={styles.paymentSection} style={{ marginTop: '24px', padding: '24px 16px', background: 'rgba(154, 183, 41, 0.05)', borderRadius: '8px', border: '1px solid rgba(154, 183, 41, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <label className={styles.paymentLabel} style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>Scan to Support</label>
                      <div className={styles.qrContainer} onClick={() => setIsZoomed(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'zoom-in' }}>
                        <img src="/qr.png" alt="QR" className={styles.qrImage} style={{ width: '200px', height: '200px', marginBottom: '8px' }} />
                        <div className={styles.zoomHint}>
                          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Click to zoom</span>
                        </div>
                      </div>
                    </div>
                    
                    <button type="submit" className={styles.pledgeBtn} disabled={!phone.trim() || !name.trim() || isSubmitting} style={{ marginTop: '24px', width: '100%' }}>
                      <span className="lang-en">{isSubmitting ? 'Processing...' : 'Submit Support'}</span>
                      <span className="lang-np">{isSubmitting ? 'प्रशोधन गरिँदै...' : 'सहयोग पुष्टि गर्नुहोस्'}</span>
                    </button>
                  </form>
                </div>
             </div>
          ) : (
             <div className={styles.storyView}>
               <div className={styles.pcHeader}>
                 <span className="lang-en">Support Climate Literacy in Nepal</span>
                 <span className="lang-np">नेपालमा जलवायु साक्षरतालाई सहयोग गर्नुहोस्</span>
               </div>
               
               <div className={styles.storyContent}>
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

               <div className={styles.pcFooter} style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' }}>
                 <button className={styles.pledgeBtn} onClick={() => setShowForm(true)}>
                   <span className="lang-en">Support Our Mission</span>
                   <span className="lang-np">हाम्रो अभियानलाई सहयोग गर्नुहोस्</span>
                 </button>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
