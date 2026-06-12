"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import StoryBackground from '../components/StoryBackground';
import IntroSequence from '../components/IntroSequence';
import ProfileSetup from '../components/ProfileSetup';
import QuizCard from '../components/QuizCard';
import ResultsReveal from '../components/ResultsReveal';
import FactCards from '../components/FactCards';
import BeaverPopup from '../components/BeaverPopup';
import CarbonCloud from '../components/CarbonCloud';
import ChapterTimeline from '../components/ChapterTimeline';
import LaunchCountdown from '../components/LaunchCountdown';
import PremiereShow from '../components/PremiereShow';
import ResultsStoryWalkthrough from '../components/ResultsStoryWalkthrough';
import HelpTheCause from '../components/HelpTheCause';
import PaperPlane from '../components/PaperPlane';
import LiveImpactToasts from '../components/LiveImpactToasts';
import MissionTracker from '../components/MissionTracker';

import { questions } from '../data/questions';
import { calculateFootprint } from '../lib/scoring';
import { useTrueTime } from '../hooks/useTrueTime';
import { asset } from '../lib/asset';
import styles from './page.module.css';

export default function Home() {
  const [lang, setLang] = useState('en');
  
  // Steps: 'intro' -> 'profile' -> 'quiz'
  const [appStep, setAppStep] = useState('intro'); // intro, profile, quiz, results_story, results
  const [userName, setUserName] = useState('');
  const [userLoc, setUserLoc] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [answers, setAnswers] = useState({});
  const [partImpacts, setPartImpacts] = useState({}); // Kept for backwards compatibility if needed
  
  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);

  const { getTrueTime, isSynced } = useTrueTime();
  const [launchState, setLaunchState] = useState('loading'); // loading, pending, premiere, completed
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem('cfc_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lang) setLang(parsed.lang);
        if (parsed.appStep) setAppStep(parsed.appStep);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.userLoc) setUserLoc(parsed.userLoc);
        if (parsed.userEmail) setUserEmail(parsed.userEmail);
        if (parsed.currentIdx !== undefined) setCurrentIdx(parsed.currentIdx);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.apiResult) setApiResult(parsed.apiResult);
        if (parsed.resultsOpen !== undefined) setResultsOpen(parsed.resultsOpen);
        if (parsed.submissionId) setSubmissionId(parsed.submissionId);
      } catch(e) {
        console.error("Failed to parse saved progress");
      }
    }
    setIsHydrated(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (!isHydrated) return;
    const progress = {
      lang,
      appStep,
      userName,
      userLoc,
      userEmail,
      currentIdx,
      answers,
      apiResult,
      resultsOpen,
      submissionId
    };
    localStorage.setItem('cfc_progress', JSON.stringify(progress));
  }, [isHydrated, lang, appStep, userName, userLoc, userEmail, currentIdx, answers, apiResult, resultsOpen, submissionId]);

  // The official synchronized launch time (11:40 AM NPT on June 5, 2026)
  const EVENT_START = new Date('2026-06-05T12:15:00+05:45').getTime();

  useEffect(() => {
    if (!isSynced) return;
    if (launchState === 'completed' || launchState === 'premiere') return;
    
    const checkState = () => {
      const now = getTrueTime();
      if (now >= EVENT_START) {
        setLaunchState('premiere');
      } else {
        setLaunchState('pending');
      }
    };
    
    checkState();
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, [isSynced, getTrueTime, launchState]);

  useEffect(() => {
    if (launchState === 'premiere') {
      const timer = setTimeout(() => {
        setLaunchState('completed');
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [launchState]);

  // Debug helper for skipping to the end
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugEnd = () => {
        console.log('Skipping to results for debugging...');
        const dummyAnswers = Object.keys(answers).length > 0 ? answers : {
          A1: "concrete", A2: "moderate", A3: "lpg", A4: "moderate", A5: "none", A6: "never",
          B1: "motorcycle", B2: "car_100to300", B3: "mixed", B4: "1medium", B5: "none", B6: "often",
          C1: "mixed", C2: "mostly_local", C3: "mixed", C4: "moderate", C5: "none",
          D1: "under30", D2: "sometimes", D3: "sometimes", D4: "some",
          E1: "bin", E2: "occasionally", E3: "rarely",
          F1: "smartphone_only", F2: "moderate", F3: "3to5",
          GQ1: "hilly", GQ2: "urban"
        };
        
        setAnswers(dummyAnswers);
        setAppStep('results');
        
        setApiResult({
           cert_id: "DEBUG-123456",
           total_emissions: "2.5",
           name: userName || "Debug User",
           answers_data: dummyAnswers
        });
        
        setLaunchState('completed');
        setResultsOpen(true);
      };

      window.debugWalkthrough = () => {
        console.log('Skipping to story walkthrough for debugging...');
        const dummyAnswers = Object.keys(answers).length > 0 ? answers : {
          A1: "concrete", A2: "moderate", A3: "lpg", A4: "moderate", A5: "none", A6: "never",
          B1: "motorcycle", B2: "car_100to300", B3: "mixed", B4: "1medium", B5: "none", B6: "often",
          C1: "mixed", C2: "mostly_local", C3: "mixed", C4: "moderate", C5: "none",
          D1: "under30", D2: "sometimes", D3: "sometimes", D4: "some",
          E1: "bin", E2: "occasionally", E3: "rarely",
          F1: "smartphone_only", F2: "moderate", F3: "3to5",
          GQ1: "hilly", GQ2: "urban"
        };
        
        setAnswers(dummyAnswers);
        setAppStep('results_story');
        
        setApiResult({
           cert_id: "DEBUG-123456",
           total_emissions: "2.5",
           name: userName || "Debug User",
           answers_data: dummyAnswers
        });
        
        setLaunchState('completed');
        setResultsOpen(false);
      };
    }
  }, [answers, userName]);


  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTargetIdx, setTransitionTargetIdx] = useState(0);
  const [navHidden, setNavHidden] = useState(false);

  // Time is finalized to afternoon
  const timeOfDay = 'afternoon';

  const handleSetAnswer = (qId, optionId, partsObj, value = null) => {
    setApiResult(null); // Fix: Clear previous API result so live metric updates immediately
    setAnswers(prev => {
      const next = { ...prev, [qId]: optionId };
      
      // If user selects Urban, remove firewood/mixed from A3 (semi-urban still cooks with firewood)
      if (qId === 'GQ2' && optionId === 'urban') {
        if (next['A3'] === 'firewood' || next['A3'] === 'mixed') {
          delete next['A3'];
        }
      }
      // If user picks Terai in GQ1, the Rural Highland/Mountain area option is hidden in GQ2 — clear a stale pick
      if (qId === 'GQ1' && optionId === 'terai' && next['GQ2'] === 'rural_highland_mountain') {
        delete next['GQ2'];
      }
      
      if (value !== null && value !== '') {
        next[`${qId}_value`] = value; // Store as string so users can freely type decimals
      } else if (value === null || value === '') {
        delete next[`${qId}_value`];
      }
      return next;
    });
    setPartImpacts(prev => ({ ...prev, [qId]: partsObj }));
  };

  // Use the exact same scoring logic as the backend API
  const liveScore = calculateFootprint(answers, answers.GQ1 || 'terai');
  const total = liveScore.total / 1000;
  const parts = {
    home: (liveScore.byDomain.A + liveScore.byDomain.E) / 1000,
    transport: liveScore.byDomain.B / 1000,
    food: liveScore.byDomain.C / 1000,
    goods: (liveScore.byDomain.D + liveScore.byDomain.F) / 1000
  };

  const handleFinishQuiz = async () => {
    try {
      // Score client-side using the same function the /api/score route used, so
      // the calculator runs as a fully static site with no server.
      const data = calculateFootprint(answers, answers.GQ1 || 'terai');
      if (data && data.total !== undefined) {
        setApiResult(data);
        
        const finalTotal = data.total / 1000;
        const finalParts = {
          home: (data.byDomain.A + data.byDomain.E) / 1000,
          transport: data.byDomain.B / 1000,
          food: data.byDomain.C / 1000,
          goods: (data.byDomain.D + data.byDomain.F) / 1000
        };

        // Exact per-category breakdown (tonnes) straight from the scoring engine, so
        // the report renders the same numbers the calculator produced — no re-derivation.
        const breakdownDetail = Object.fromEntries(
          Object.entries(data.breakdown).map(([k, v]) => [k, v / 1000])
        );

        const baseRow = {
          name: userName || "Traveler",
          email: userEmail || "",
          location: userLoc || "Earth",
          total_emissions: finalTotal,
          breakdown_home: finalParts.home,
          breakdown_transport: finalParts.transport,
          breakdown_food: finalParts.food,
          breakdown_goods: finalParts.goods,
          answers_data: answers,
          payment_status: 'general'
        };

        // RLS lets anon insert but not read the table back (emails stay private),
        // so .insert().select() is rejected wholesale and the row is never saved.
        // The submit_checkup RPC (see add_submit_checkup_rpc.sql) inserts under
        // SECURITY DEFINER and returns only the new row's id.
        const { data: newId, error: rpcError } = await supabase.rpc('submit_checkup', {
          p_name: baseRow.name,
          p_email: baseRow.email,
          p_location: baseRow.location,
          p_total: baseRow.total_emissions,
          p_home: baseRow.breakdown_home,
          p_transport: baseRow.breakdown_transport,
          p_food: baseRow.breakdown_food,
          p_goods: baseRow.breakdown_goods,
          p_answers: answers,
          p_breakdown: breakdownDetail
        });

        if (!rpcError && newId !== null && newId !== undefined) {
          setSubmissionId(newId);
        } else {
          // RPC not migrated yet: insert without RETURNING so the check-up still
          // reaches the database. submissionId stays null, in which case the
          // report-request flow inserts its own full row instead of updating this one.
          let { error } = await supabase
            .from('calculator_submissions')
            .insert([{ ...baseRow, breakdown_detail: breakdownDetail }]);

          // If the breakdown_detail column hasn't been migrated yet, fall back to the
          // base row so submissions never fail. The report recomputes the breakdown
          // from answers_data in that case, so accuracy is preserved either way.
          if (error && /breakdown_detail/i.test(error.message || '')) {
            ({ error } = await supabase
              .from('calculator_submissions')
              .insert([baseRow]));
          }
          if (error) console.error('Failed to save submission:', error);
        }
      }
    } catch(err) {
      console.error(err);
    }
    setAppStep('results_story');
  };
  
  let displayTotal = total;
  let displayParts = parts;

  if (apiResult && apiResult.total > 0) {
    displayTotal = apiResult.total / 1000;
    displayParts = {
      home: (apiResult.byDomain.A + apiResult.byDomain.E) / 1000,
      transport: apiResult.byDomain.B / 1000,
      food: apiResult.byDomain.C / 1000,
      goods: (apiResult.byDomain.D + apiResult.byDomain.F) / 1000
    };
  }
  
  const raw = Math.max(0, Math.min(1, total / 6));
  const hiddenScore = (appStep !== 'intro' && appStep !== 'profile') ? raw * raw * (3 - 2 * raw) : 0;
  const bgProgress = (appStep !== 'intro' && appStep !== 'profile') ? currentIdx / Math.max(1, questions.length - 1) : 0;

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  const getChapterData = (idx) => {
    if (!questions[idx]) return { num: 1, name: { en: '', np: '' } };
    const cat = questions[idx].category.en;
    if (cat === 'Geodemography') return { num: 1, name: questions[idx].category };
    if (cat === 'Home & Energy') return { num: 2, name: questions[idx].category };
    if (cat === 'Transport') return { num: 3, name: questions[idx].category };
    if (cat === 'Food') return { num: 4, name: questions[idx].category };
    if (cat === 'Consumption') return { num: 5, name: questions[idx].category };
    if (cat === 'Waste') return { num: 6, name: questions[idx].category };
    if (cat === 'Digital') return { num: 7, name: questions[idx].category };
    return { num: 1, name: questions[idx].category };
  };

  const currentChapter = getChapterData(currentIdx);
  const displayChapter = isTransitioning ? getChapterData(transitionTargetIdx) : currentChapter;

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) return;
    
    const nextChapter = getChapterData(nextIdx);
    if (nextChapter.num !== currentChapter.num) {
      setTransitionTargetIdx(nextIdx);
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx(nextIdx);
        setIsTransitioning(false);
      }, 1500);
    } else {
      setCurrentIdx(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  // Start the check-up over from the profile step. Clears every answer and
  // the saved progress so users are never stuck on the results screen.
  const handleRetake = () => {
    const message = lang === 'np'
      ? 'फेरि सुरु गर्ने हो? तपाईंका हालका जवाफहरू हटाइनेछन्।'
      : 'Start over? Your current answers will be cleared.';
    if (!window.confirm(message)) return;

    localStorage.removeItem('cfc_progress');
    setAnswers({});
    setPartImpacts({});
    setCurrentIdx(0);
    setTransitionTargetIdx(0);
    setIsTransitioning(false);
    setApiResult(null);
    setSubmissionId(null);
    setResultsOpen(false);
    setHelpOpen(false);
    setAppStep('profile');
  };



  return (
    <>
    <div className={styles.appWrapper}>
      <div className={styles.fixedFooterCredits}>
        <div className="lang-en">
          <span>Nepal's first Climate Checkup Tool.</span>
          <span>Developed by Appropriate Technology Labs.</span>
          <span>Version 1.0.1</span>
        </div>
        <div className="lang-np">
          <span>नेपालको पहिलो जलवायु जाँच उपकरण।</span>
          <span>एप्रोप्रिएट टेक्नोलोजी ल्याब्स द्वारा विकसित।</span>
          <span>संस्करण १.०.१</span>
        </div>
      </div>
      {!isHydrated && <div style={{width: '100%', height: '100%', background: 'black', position: 'absolute', zIndex: 999999}}></div>}
      
      {isHydrated && launchState === 'pending' && <LaunchCountdown targetDateEpoch={EVENT_START} getTrueTime={getTrueTime} lang={lang} audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled} />}
      {isHydrated && launchState === 'premiere' && <PremiereShow lang={lang} audioEnabled={audioEnabled} onSkip={() => setLaunchState('completed')} />}
      
      {isHydrated && launchState === 'completed' && (
        <>
          <StoryBackground score={hiddenScore} progress={bgProgress} timeOfDay={timeOfDay} chapter={displayChapter.num} />
          


          <div className={`${styles.app} ${appStep === 'results' ? styles.appResults : ''}`}>
            <MissionTracker hidden={navHidden} />
            <div className={styles.debugPanel}>
               <div className={styles.debugBtns}>
               </div>
            </div>

            <header className={`${styles.chrome} ${appStep !== 'intro' && appStep !== 'profile' ? styles.chromeCompact : ''} ${navHidden ? styles.chromeHidden : ''}`}>
              <div className={styles.chromeInner}>
                <div className={styles.brand}>
                  <img src={asset('/logo.png')} alt="Appropriate Technology Lab" className={styles.brandMark} />
                </div>
                <div className={styles.chromeRight}>
                  <div className={styles.langToggle}>
                    <button className={lang === 'en' ? styles.active : ''} onClick={() => setLang('en')}>EN</button>
                    <button className={lang === 'np' ? styles.active : ''} onClick={() => setLang('np')} style={{letterSpacing: 0}}>ने</button>
                  </div>
                  {appStep !== 'intro' && appStep !== 'profile' && (
                    <button className={styles.retakeBtn} onClick={handleRetake} title="Retake the Check-Up">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                      <span className={styles.retakeText}>
                        <span className="lang-en">Retake</span>
                        <span className="lang-np">पुनः जाँच</span>
                      </span>
                    </button>
                  )}
                  {appStep !== 'intro' && (
                    <PaperPlane onClick={() => setHelpOpen(true)} />
                  )}
                </div>
              </div>
            </header>

            <button 
              className={styles.navToggleBtn} 
              onClick={() => setNavHidden(!navHidden)}
              title="Toggle Navigation"
            >
              {navHidden ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
              )}
            </button>

            <div className={styles.quizContainer} style={{ marginTop: '20px' }}>
              {appStep === 'intro' && (
                <IntroSequence onComplete={() => setAppStep('profile')} />
              )}
              {appStep === 'profile' && (
                <ProfileSetup onComplete={(n, l, e) => {
                  setUserName(n);
                  setUserLoc(l);
                  setUserEmail(e);
                  setAppStep('quiz');
                }} />
              )}
              {appStep === 'quiz' && !isTransitioning && (
                <>
                  <ChapterTimeline currentChapterNum={currentChapter.num} />
                  <QuizCard 
                    currentIdx={currentIdx} 
                    answers={answers} 
                    setAnswer={handleSetAnswer} 
                    onNext={handleNext}
                    onPrev={handlePrev}
                    finishQuiz={handleFinishQuiz}
                    chapterNum={currentChapter.num}
                  />
                </>
              )}

              {isTransitioning && (
                <div className={styles.chapterTransition}>
                   <div className={styles.chapterNum}>
                     <span className="lang-en">Chapter {displayChapter.num}</span>
                     <span className="lang-np">अध्याय {displayChapter.num}</span>
                   </div>
                   <div className={styles.chapterName}>
                     <span className="lang-en">{displayChapter.name.en}</span>
                     <span className="lang-np">{displayChapter.name.np}</span>
                   </div>
                </div>
              )}

              {appStep === 'results_story' && (
                <ResultsStoryWalkthrough total={displayTotal} onComplete={() => setResultsOpen(true)} />
              )}
            </div>
            
            <div className={styles.bottomMissionContainer}>
            </div>
          </div>
          <ResultsReveal open={resultsOpen} close={() => setResultsOpen(false)} total={displayTotal} parts={displayParts} userName={userName} userLoc={userLoc} userEmail={userEmail} answers={answers} submissionId={submissionId} onOpenHelp={() => setHelpOpen(true)} onRetake={handleRetake} />
          <HelpTheCause open={helpOpen} close={() => setHelpOpen(false)} userName={userName} userEmail={userEmail} />
        </>
      )}
    </div>

    {/* Render ALL fixed-position elements outside appWrapper to bypass iOS Safari's
       "overflow creates containing block" bug that swallows position:fixed children */}
    {isHydrated && launchState === 'completed' && appStep !== 'intro' && (
      <LiveImpactToasts />
    )}
    {appStep === 'quiz' && !isTransitioning && (
      <>
        <CarbonCloud total={displayTotal} />
        <FactCards currentIdx={currentIdx} />
        <BeaverPopup currentIdx={currentIdx} />
      </>
    )}
    </>
  );
}
