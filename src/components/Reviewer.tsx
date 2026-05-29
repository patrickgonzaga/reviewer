import React from 'react';
import type { Question, UserProgress, Category, Difficulty, EvaluationStatus } from '../types';
import { Search, ChevronRight, ChevronLeft, Lightbulb, Code, BookOpen, AlertTriangle } from 'lucide-react';

interface ReviewerProps {
  questions: Question[];
  progress: UserProgress[];
  onSaveProgress: (questionId: string, status: EvaluationStatus) => void;
  selectedCategory: Category | '';
  setSelectedCategory: (cat: Category | '') => void;
}

export default function Reviewer({
  questions,
  progress,
  onSaveProgress,
  selectedCategory,
  setSelectedCategory
}: ReviewerProps) {
  // Local filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty | 'All'>('All');
  const [selectedProgress, setSelectedProgress] = React.useState<EvaluationStatus | 'All'>('All');
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string>('');
  const [revealed, setRevealed] = React.useState(false);

  // Map progress state
  const progressMap = React.useMemo(() => {
    const map = new Map<string, EvaluationStatus>();
    progress.forEach(p => map.set(p.questionId, p.status));
    return map;
  }, [progress]);

  // Filtered questions
  const filteredQuestions = React.useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || q.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      
      const status = progressMap.get(q.id) || 'unstarted';
      const matchesProgress = selectedProgress === 'All' || status === selectedProgress;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesProgress;
    });
  }, [questions, searchTerm, selectedCategory, selectedDifficulty, selectedProgress, progressMap]);

  // Current active question
  const currentQuestion = React.useMemo(() => {
    if (!selectedQuestionId && filteredQuestions.length > 0) {
      return filteredQuestions[0];
    }
    return questions.find(q => q.id === selectedQuestionId) || filteredQuestions[0];
  }, [questions, selectedQuestionId, filteredQuestions]);

  // Handle question change
  const handleSelectQuestion = (id: string) => {
    setSelectedQuestionId(id);
    setRevealed(false);
  };

  // Safe reset when filters change
  React.useEffect(() => {
    if (filteredQuestions.length > 0) {
      const exists = filteredQuestions.some(q => q.id === selectedQuestionId);
      if (!exists) {
        setSelectedQuestionId(filteredQuestions[0].id);
        setRevealed(false);
      }
    } else {
      setSelectedQuestionId('');
      setRevealed(false);
    }
  }, [filteredQuestions, selectedQuestionId]);

  // Next / Previous navigation
  const handleNext = () => {
    if (!currentQuestion) return;
    const currentIndex = filteredQuestions.findIndex(q => q.id === currentQuestion.id);
    if (currentIndex < filteredQuestions.length - 1) {
      handleSelectQuestion(filteredQuestions[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (!currentQuestion) return;
    const currentIndex = filteredQuestions.findIndex(q => q.id === currentQuestion.id);
    if (currentIndex > 0) {
      handleSelectQuestion(filteredQuestions[currentIndex - 1].id);
    }
  };

  // Helper: category specific CSS badges
  const getCategoryBadgeClass = (cat: Category) => {
    switch (cat) {
      case 'C# / .NET Core': return 'badge-csharp';
      case 'Multi Tenant': return 'badge-tenant';
      case 'APIs, ORM & SQL': return 'badge-api';
      case 'React / Angular': return 'badge-react';
      case 'Azure & CI/CD': return 'badge-azure';
      case 'AI-First Dev': return 'badge-ai';
      case 'Security': return 'badge-security';
      default: return '';
    }
  };

  const currentStatus = currentQuestion ? (progressMap.get(currentQuestion.id) || 'unstarted') : 'unstarted';

  // Highlight terms or show info
  const [activeTerm, setActiveTerm] = React.useState<{term: string, explanation: string} | null>(null);

  return (
    <div className="reviewer-layout">
      {/* SIDEBAR: Filters & List */}
      <div className="reviewer-sidebar">
        
        {/* Search */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search scenarios or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search 
              size={18} 
              className="text-muted" 
              style={{ position: 'absolute', left: '14px', top: '12px' }} 
            />
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Category Filter */}
          <div className="filter-group">
            <span className="filter-label">Domain</span>
            <div className="filter-pill-list">
              <button 
                className={`filter-pill ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All
              </button>
              {(['C# / .NET Core', 'Multi Tenant', 'APIs, ORM & SQL', 'React / Angular', 'Azure & CI/CD', 'AI-First Dev', 'Security'] as Category[]).map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ fontSize: '11px' }}
                >
                  {cat.split(' ')[0]} {/* Short name */}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="filter-group">
            <span className="filter-label">Target Tier</span>
            <div className="filter-pill-list">
              {(['All', 'Junior', 'Senior', 'Lead'] as const).map(diff => (
                <button
                  key={diff}
                  className={`filter-pill ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Progress state filter */}
          <div className="filter-group">
            <span className="filter-label">Status</span>
            <div className="filter-pill-list">
              <button 
                className={`filter-pill ${selectedProgress === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedProgress('All')}
              >
                All
              </button>
              <button 
                className={`filter-pill ${selectedProgress === 'unstarted' ? 'active' : ''}`}
                onClick={() => setSelectedProgress('unstarted')}
              >
                Unstarted
              </button>
              <button 
                className={`filter-pill ${selectedProgress === 'mastered' ? 'active' : ''}`}
                onClick={() => setSelectedProgress('mastered')}
              >
                Mastered
              </button>
              <button 
                className={`filter-pill ${selectedProgress === 'review' ? 'active' : ''}`}
                onClick={() => setSelectedProgress('review')}
              >
                Review
              </button>
              <button 
                className={`filter-pill ${selectedProgress === 'struggled' ? 'active' : ''}`}
                onClick={() => setSelectedProgress('struggled')}
              >
                Struggled
              </button>
            </div>
          </div>

        </div>

        {/* Question List */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div className="filter-label" style={{ marginBottom: '12px' }}>
            Scenarios ({filteredQuestions.length})
          </div>
          <div className="question-list-scroll">
            {filteredQuestions.map((q) => {
              const status = progressMap.get(q.id) || 'unstarted';
              let borderStyle = '1px solid var(--border-color)';
              if (status === 'mastered') borderStyle = '1px solid rgba(16, 185, 129, 0.3)';
              else if (status === 'review') borderStyle = '1px solid rgba(245, 158, 11, 0.3)';
              else if (status === 'struggled') borderStyle = '1px solid rgba(244, 63, 94, 0.3)';

              return (
                <button
                  key={q.id}
                  className={`q-list-item ${currentQuestion?.id === q.id ? 'active' : ''}`}
                  onClick={() => handleSelectQuestion(q.id)}
                  style={{ border: borderStyle }}
                >
                  <div className="q-item-id">{q.id}</div>
                  <div className="q-item-title">{q.title}</div>
                </button>
              );
            })}
            {filteredQuestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No matching scenarios found.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* WORKSTATION: Active Question details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {currentQuestion ? (
          <div className="glass-panel reviewer-card">
            
            {/* Header Details */}
            <div>
              <div className="reviewer-card-header">
                <div className="badge-row">
                  <span className={`badge ${getCategoryBadgeClass(currentQuestion.category)}`}>
                    {currentQuestion.category}
                  </span>
                  <span className={`badge ${
                    currentQuestion.difficulty === 'Lead' ? 'badge-lead' : 
                    currentQuestion.difficulty === 'Senior' ? 'badge-senior' : 'badge-junior'
                  }`}>
                    {currentQuestion.difficulty} Level
                  </span>
                </div>
                <div className="q-id-code">{currentQuestion.id}</div>
              </div>

              <h1 className="reviewer-card-title">{currentQuestion.title}</h1>
              
              {/* Question Text */}
              <p className="q-body-text" style={{ marginTop: '24px' }}>{currentQuestion.text}</p>

              {/* Code Snippet if applicable */}
              {currentQuestion.codeSnippet && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <Code size={14} /> Mapped Scenario File Snippet
                  </div>
                  <pre className="code-block">
                    <code>
                      {/* Simple basic syntax highlight replacing keywords for visual flare */}
                      {currentQuestion.codeSnippet.split('\n').map((line, idx) => (
                        <div key={idx}>
                          {line.split(' ').map((word, wIdx) => {
                            if (['public', 'private', 'class', 'static', 'using', 'return', 'protected', 'override', 'void', 'var', 'new', 'if', 'else', 'await', 'async', 'byte', 'fixed'].includes(word.replace(/[^a-zA-Z]/g, ''))) {
                              return <span key={wIdx} className="code-keyword">{word} </span>;
                            }
                            if (['string', 'int', 'decimal', 'Task', 'ValueTask', 'ReadOnlySpan', 'byte[]', 'AsyncLocal', 'DbContext'].includes(word.replace(/[^a-zA-Z]/g, ''))) {
                              return <span key={wIdx} className="code-type">{word} </span>;
                            }
                            if (word.startsWith('//')) {
                              return <span key={wIdx} className="code-comment">{word} </span>;
                            }
                            return <span key={wIdx}>{word} </span>;
                          })}
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              )}

              {/* Multiple Choice Prompts */}
              {currentQuestion.choices && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Technical Assessment Alternatives:
                  </div>
                  <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentQuestion.choices.map((choice, cIdx) => (
                      <li 
                        key={cIdx} 
                        style={{ 
                          padding: '12px 16px', 
                          borderRadius: 'var(--radius-sm)', 
                          border: '1px solid var(--border-color)', 
                          background: 'rgba(255,255,255,0.01)',
                          fontSize: '14px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <strong style={{ color: 'var(--accent-cyan)', marginRight: '8px' }}>
                          {String.fromCharCode(65 + cIdx)}.
                        </strong>
                        {choice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Solution Trigger */}
              {!revealed ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                  <button 
                    className="btn btn-primary text-glow" 
                    onClick={() => setRevealed(true)}
                    style={{ padding: '14px 40px', fontSize: '15px' }}
                  >
                    <Lightbulb size={18} /> Reveal Technical Answer & CTO Insight
                  </button>
                </div>
              ) : (
                <div className="insight-drawer">
                  
                  {/* Ideal Answer Criteria */}
                  <div className="insight-section-title">
                    <BookOpen size={16} /> Key Grading Benchmarks (What they must say)
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-sm)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {currentQuestion.idealAnswer.split('\n').map((para, pIdx) => (
                      <p key={pIdx} style={{ marginBottom: para.startsWith('-') ? '6px' : '14px' }}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* CTO 60-Year Insight */}
                  <div className="cto-critique-box" style={{ marginTop: '24px' }}>
                    <div className="cto-critique-title">60-Year CTO Critique & Interview Advice</div>
                    <p className="cto-critique-text">"{currentQuestion.ctoInsight}"</p>
                  </div>

                  {/* Key Terminology Hover Explainer */}
                  {currentQuestion.keyTerms && currentQuestion.keyTerms.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <div className="insight-section-title">
                        <AlertTriangle size={15} /> Jargon Spotlight (Hover to define term)
                      </div>
                      <div className="glossary-links">
                        {currentQuestion.keyTerms.map((term, tIdx) => (
                          <div 
                            key={tIdx} 
                            className="glossary-chip"
                            onMouseEnter={() => setActiveTerm(term)}
                            onMouseLeave={() => setActiveTerm(null)}
                          >
                            {term.term}
                          </div>
                        ))}
                      </div>
                      {activeTerm && (
                        <div 
                          className="glass-panel" 
                          style={{ 
                            marginTop: '10px', 
                            padding: '12px 16px', 
                            borderColor: 'var(--accent-cyan)', 
                            background: '#090d16',
                            animation: 'fadeIn 0.2s ease-out'
                          }}
                        >
                          <strong style={{ color: 'var(--accent-cyan)', fontSize: '13px' }}>
                            {activeTerm.term}:
                          </strong>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {activeTerm.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Actions & Self Evaluation */}
            <div className="reviewer-actions">
              
              {/* Self Evaluation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Self-Evaluate:
                </span>
                <div className="self-eval-box">
                  <button 
                    className={`eval-btn eval-btn-struggled ${currentStatus === 'struggled' ? 'active' : ''}`}
                    onClick={() => onSaveProgress(currentQuestion.id, 'struggled')}
                  >
                    Struggled
                  </button>
                  <button 
                    className={`eval-btn eval-btn-review ${currentStatus === 'review' ? 'active' : ''}`}
                    onClick={() => onSaveProgress(currentQuestion.id, 'review')}
                  >
                    Needs Review
                  </button>
                  <button 
                    className={`eval-btn eval-btn-mastered ${currentStatus === 'mastered' ? 'active' : ''}`}
                    onClick={() => onSaveProgress(currentQuestion.id, 'mastered')}
                  >
                    Mastered
                  </button>
                </div>
              </div>

              {/* Navigation Back/Next */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={handlePrev}
                  disabled={filteredQuestions.findIndex(q => q.id === currentQuestion.id) === 0}
                  style={{ padding: '8px 16px' }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleNext}
                  disabled={filteredQuestions.findIndex(q => q.id === currentQuestion.id) === filteredQuestions.length - 1}
                  style={{ padding: '8px 16px' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <BookOpen size={48} className="text-muted" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>No Scenarios Available</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '350px' }}>
              Verify your active filters above, or reset the question catalog inside the Database Console.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
