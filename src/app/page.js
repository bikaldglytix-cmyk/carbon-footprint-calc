"use client";
import { useState, useEffect } from 'react';
import StoryBackground from '../components/StoryBackground';
import IntroSequence from '../components/IntroSequence';
import ProfileSetup from '../components/ProfileSetup';
import QuizCard from '../components/QuizCard';
import ResultsReveal from '../components/ResultsReveal';
import FactCards from '../components/FactCards';
import BeaverPopup from '../components/BeaverPopup';
import CarbonCloud from '../components/CarbonCloud';
import ChapterTimeline from '../components/ChapterTimeline';
import ResultsStoryWalkthrough from '../components/ResultsStoryWalkthrough';
import HelpTheCause from '../components/HelpTheCause';
import { questions } from '../data/questions';
import { calculateFootprint } from '../lib/scoring';
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

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTargetIdx, setTransitionTargetIdx] = useState(0);

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
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (data && data.total !== undefined) {
        setApiResult(data);
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

  const handleSkipChapter = () => {
    let nextIdx = currentIdx + 1;
    while (nextIdx < questions.length) {
      if (getChapterData(nextIdx).num !== currentChapter.num) {
        break;
      }
      nextIdx++;
    }
    
    if (nextIdx >= questions.length) {
      // If we are on the last chapter and hit skip, finish the quiz
      setCurrentIdx(questions.length - 1);
      setShowResults(true);
      return;
    }
    
    setTransitionTargetIdx(nextIdx);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(nextIdx);
      setIsTransitioning(false);
    }, 1500);
  };



  return (
    <div className={styles.appWrapper}>
      <StoryBackground score={hiddenScore} progress={bgProgress} timeOfDay={timeOfDay} chapter={displayChapter.num} />
      
      <div className={styles.app}>
        <div className={styles.debugPanel}>
           <div className={styles.debugBtns}>
             <button onClick={() => {
               setUserName('Guest');
               setUserLoc('Earth');
               setAppStep('results_story');
             }}>Skip to Results</button>
           </div>
        </div>

        <header className={styles.chrome}>
          <div className={styles.chromeInner}>
            <div className={styles.brand}>
              <img src="/logo.png" alt="Appropriate Technology Lab" className={styles.brandMark} />
            </div>
            <div className={styles.chromeRight}>
              <div className={styles.langToggle}>
                <button className={lang === 'en' ? styles.active : ''} onClick={() => setLang('en')}>EN</button>
                <button className={lang === 'np' ? styles.active : ''} onClick={() => setLang('np')} style={{letterSpacing: 0}}>ने</button>
              </div>
              <button className={styles.helpCauseBtnGlobal} onClick={() => setHelpOpen(true)}>
                <span className="lang-en">Help the Cause</span>
                <span className="lang-np">अभियानलाई सहयोग गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </header>

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
              onPrev={() => setCurrentIdx(prev => prev - 1)}
              onSkipChapter={handleSkipChapter}
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
      </div>

      {appStep === 'quiz' && !isTransitioning && (
        <>
          <CarbonCloud total={displayTotal} />
          <FactCards currentIdx={currentIdx} />
          <BeaverPopup currentIdx={currentIdx} />
        </>
      )}
      <ResultsReveal open={resultsOpen} close={() => setResultsOpen(false)} total={displayTotal} parts={displayParts} userName={userName} userLoc={userLoc} userEmail={userEmail} answers={answers} />
      <HelpTheCause open={helpOpen} close={() => setHelpOpen(false)} userName={userName} userEmail={userEmail} />
    </div>
  );
}
