import React from 'react';
import type { Question, ExamSession, Category, ExamQuestionResult } from '../types';
import { Play, Award, Clock, ArrowLeft, ArrowRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface ExamProps {
  questions: Question[];
  onSaveExamSession: (session: ExamSession) => void;
}

export default function Exam({ questions, onSaveExamSession }: ExamProps) {
  // Exam states: 'setup' | 'active' | 'scorecard'
  const [sessionState, setSessionState] = React.useState<'setup' | 'active' | 'scorecard'>('setup');
  
  // Setup config states
  const [selectedCats, setSelectedCats] = React.useState<Category[]>([
    'C# / .NET Core', 'Multi Tenant', 'APIs, ORM & SQL', 'React / Angular', 'Azure & CI/CD', 'AI-First Dev', 'Security'
  ]);
  const [examSize, setExamSize] = React.useState<number>(10);
  const [isTimed, setIsTimed] = React.useState<boolean>(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState<number>(15);

  // Active exam runtime states
  const [examQuestions, setExamQuestions] = React.useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = React.useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Map<string, number>>(new Map()); // Map<qId, selectedIdx>
  const [timeRemainingSeconds, setTimeRemainingSeconds] = React.useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);

  // Scorecard state
  const [completedSession, setCompletedSession] = React.useState<ExamSession | null>(null);

  // Timer reference
  const timerRef = React.useRef<any | null>(null);

  const categories: Category[] = [
    'C# / .NET Core', 'Multi Tenant', 'APIs, ORM & SQL', 'React / Angular', 'Azure & CI/CD', 'AI-First Dev', 'Security'
  ];

  // Toggle category choice
  const handleToggleCat = (cat: Category) => {
    if (selectedCats.includes(cat)) {
      if (selectedCats.length > 1) {
        setSelectedCats(selectedCats.filter(c => c !== cat));
      }
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  // Start the exam
  const handleStartExam = () => {
    // Filter questions by selected categories
    const pool = questions.filter(q => selectedCats.includes(q.category) && q.choices && q.choices.length > 0);
    
    if (pool.length === 0) {
      alert("No multiple-choice questions found in the selected categories. Reset your database inside the console first!");
      return;
    }

    // Shuffle pool and pick size
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(examSize, shuffled.length));

    setExamQuestions(selected);
    setCurrentQIndex(0);
    setSelectedAnswers(new Map());
    
    if (isTimed) {
      setTimeRemainingSeconds(timeLimitMinutes * 60);
    }
    setElapsedSeconds(0);
    setSessionState('active');

    // Start timer interval
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      if (isTimed) {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
  };

  // Format timer string
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Select alternative
  const handleSelectOption = (qId: string, idx: number) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(qId, idx);
    setSelectedAnswers(newAnswers);
  };

  // Clean timer
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Force submit on timer expire
  const handleForceSubmit = () => {
    // Need to trigger calculations using the current selectedAnswers map
    handleSubmitExam(true);
  };

  // Submit Exam Calculations
  const handleSubmitExam = (force: boolean = false) => {
    if (!force && selectedAnswers.size < examQuestions.length) {
      const confirm = window.confirm(`You have unanswered questions (${examQuestions.length - selectedAnswers.size} remaining). Submit anyway?`);
      if (!confirm) return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const results: ExamQuestionResult[] = examQuestions.map(q => {
      const selected = selectedAnswers.get(q.id);
      const isCorrect = selected !== undefined && selected === q.answerIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        selectedAnswerIndex: selected,
        isCorrect
      };
    });

    const scorePercentage = Math.round((correctCount / examQuestions.length) * 100);

    const newSession: ExamSession = {
      id: Math.random().toString(36).substring(2, 9),
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      categories: selectedCats,
      totalQuestions: examQuestions.length,
      correctAnswersCount: correctCount,
      scorePercentage,
      durationSeconds: elapsedSeconds,
      results
    };

    onSaveExamSession(newSession);
    setCompletedSession(newSession);
    setSessionState('scorecard');
  };

  // Grade helper
  const getLetterGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', class: 'text-gradient', desc: 'Distinguished Architect' };
    if (score >= 80) return { grade: 'B', class: 'text-glow', desc: 'Senior Engineer' };
    if (score >= 70) return { grade: 'C', class: '', desc: 'Competent Developer' };
    if (score >= 60) return { grade: 'D', class: '', desc: 'Approaching Senior' };
    return { grade: 'F', class: '', desc: 'Junior Level - Needs Focus' };
  };

  const activeQuestion = examQuestions[currentQIndex];

  return (
    <div>
      {/* 1. CONFIGURATION SETUP */}
      {sessionState === 'setup' && (
        <div className="glass-panel exam-setup">
          <Award size={48} className="text-gradient text-glow" style={{ margin: '0 auto 16px auto' }} />
          <h1 className="exam-setup-title">CTO's Senior .NET Mock Assessment</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
            Configure and run a custom multiple-choice simulation under countdown parameters to validate your engineering tier.
          </p>

          <div className="exam-setup-form">
            {/* Category Selects */}
            <div className="form-control">
              <span className="form-label">Include Assessment Categories</span>
              <div className="category-select-grid">
                {categories.map(cat => (
                  <div
                    key={cat}
                    className={`category-checkbox-label ${selectedCats.includes(cat) ? 'selected' : ''}`}
                    onClick={() => handleToggleCat(cat)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(cat)}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form grid */}
            <div className="form-grid-2">
              {/* Question Count */}
              <div className="form-control">
                <label className="form-label">Total Questions</label>
                <select
                  className="form-input"
                  value={examSize}
                  onChange={(e) => setExamSize(Number(e.target.value))}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                  <option value={50}>50 Questions</option>
                </select>
              </div>

              {/* Time Limits */}
              <div className="form-control">
                <label className="form-label">Timer Configuration</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="category-checkbox-label" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsTimed(!isTimed)}>
                    <input type="checkbox" checked={isTimed} readOnly />
                    <span>Timed</span>
                  </div>
                  {isTimed && (
                    <select
                      className="form-input"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      style={{ flex: 1 }}
                    >
                      <option value={5}>5 Min</option>
                      <option value={10}>10 Min</option>
                      <option value={15}>15 Min</option>
                      <option value={30}>30 Min</option>
                      <option value={60}>60 Min</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: '24px', width: '100%', padding: '14px' }}
              onClick={handleStartExam}
            >
              <Play size={18} /> Initialize Assessment Session
            </button>
          </div>
        </div>
      )}

      {/* 2. ACTIVE EXAM LOOP */}
      {sessionState === 'active' && activeQuestion && (
        <div className="exam-layout">
          
          {/* Active Navigation Bar */}
          <div className="glass-panel exam-meta-bar">
            <div className="exam-q-counter">
              Question <span style={{ color: 'var(--text-primary)' }}>{currentQIndex + 1}</span> of {examQuestions.length}
            </div>
            
            {isTimed && (
              <div className={`timer-box ${timeRemainingSeconds < 60 ? 'timer-pulsing' : ''}`}>
                <Clock size={16} />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="exam-progress-bar">
            <div 
              className="exam-progress-fill" 
              style={{ width: `${((currentQIndex + 1) / examQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Main Card */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-ai" style={{ fontSize: '11px' }}>{activeQuestion.category}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{activeQuestion.id}</span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', lineHeight: '1.4' }}>
              {activeQuestion.text}
            </h2>

            {/* Optional snippet */}
            {activeQuestion.codeSnippet && (
              <pre className="code-block" style={{ maxHeight: '300px' }}>
                <code>{activeQuestion.codeSnippet}</code>
              </pre>
            )}

            {/* Answer Options */}
            <div className="exam-choices-list">
              {activeQuestion.choices?.map((choice, idx) => {
                const isSelected = selectedAnswers.get(activeQuestion.id) === idx;
                return (
                  <button
                    key={idx}
                    className={`choice-item-label ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(activeQuestion.id, idx)}
                  >
                    <div className="choice-badge">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span style={{ fontSize: '14px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {choice}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Footer navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                <ArrowLeft size={16} /> Prev
              </button>

              {currentQIndex < examQuestions.length - 1 ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="btn btn-primary text-glow"
                  onClick={() => handleSubmitExam(false)}
                >
                  Submit & Grade Exam
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. ASSESSMENT SCORECARD */}
      {sessionState === 'scorecard' && completedSession && (
        <div className="scorecard-box glass-panel">
          <Award size={48} className="text-gradient" style={{ margin: '0 auto 16px auto' }} />
          
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Technical Grade Sheet</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Detailed breakdown of your senior tech assessment session.
          </p>

          {/* Letter Grade Ring */}
          <div style={{ marginTop: '32px' }}>
            <div className="grade-display">
              {getLetterGrade(completedSession.scorePercentage).grade}
            </div>
            <h3 className={`text-glow`} style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
              {getLetterGrade(completedSession.scorePercentage).desc}
            </h3>
          </div>

          {/* Core Results Stats */}
          <div className="scorecard-stats">
            <div className="stat-item">
              <div className="stat-value text-gradient">{completedSession.scorePercentage}%</div>
              <div className="stat-label">Score</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                {completedSession.correctAnswersCount} / {completedSession.totalQuestions}
              </div>
              <div className="stat-label">Correct Answers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>
                {formatTime(completedSession.durationSeconds)}
              </div>
              <div className="stat-label">Time Taken</div>
            </div>
          </div>

          {/* Question-wise critique grid */}
          <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '32px', marginTop: '32px' }}>
            <h2 className="card-title" style={{ marginBottom: '20px' }}>Audit Log & CTO Annotations</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {examQuestions.map((q, idx) => {
                const result = completedSession.results.find(r => r.questionId === q.id);
                const isCorrect = result?.isCorrect || false;
                const selectedIdx = result?.selectedAnswerIndex;

                return (
                  <div 
                    key={q.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '24px', 
                      borderColor: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                      background: isCorrect ? 'rgba(16, 185, 129, 0.01)' : 'rgba(244, 63, 94, 0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge badge-ai" style={{ fontSize: '10px' }}>{q.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isCorrect ? (
                          <span style={{ color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Correct
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-rose)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={14} /> Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {idx + 1}. {q.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{q.text}</p>

                    {/* Answer check */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                      <div>
                        <strong>Your Response:</strong>{' '}
                        {selectedIdx !== undefined && q.choices ? (
                          <span style={{ color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                            ({String.fromCharCode(65 + selectedIdx)}) {q.choices[selectedIdx]}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-rose)' }}>Unanswered</span>
                        )}
                      </div>
                      {!isCorrect && q.choices && q.answerIndex !== undefined && (
                        <div>
                          <strong>Correct Key:</strong>{' '}
                          <span style={{ color: 'var(--accent-emerald)' }}>
                            ({String.fromCharCode(65 + q.answerIndex)}) {q.choices[q.answerIndex]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Brief CTO insight */}
                    <div style={{ fontSize: '12px', fontStyle: 'italic', borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '10px', color: 'var(--text-muted)' }}>
                      <strong>CTO Insight:</strong> "{q.ctoInsight}"
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset back to setup */}
          <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setSessionState('setup')}
            >
              <RefreshCw size={14} /> Retake Assessment
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
