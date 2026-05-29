import React from 'react';
import type { Question, Category, Difficulty, KeyTerm } from '../types';
import { Plus, Trash2, Edit, Download, Upload, RefreshCw, Search, X } from 'lucide-react';

interface DbManagerProps {
  questions: Question[];
  onAddQuestion: (q: Question) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onResetDb: () => Promise<void>;
  onImportDb: (jsonStr: string, append?: boolean) => Promise<void>;
  onExportDb: () => Promise<void>;
}

export default function DbManager({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onResetDb,
  onImportDb,
  onExportDb
}: DbManagerProps) {
  // Search & Filter
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCat, setSelectedCat] = React.useState<Category | 'All'>('All');

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 15;

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<Question | null>(null);

  // Form Fields
  const [formId, setFormId] = React.useState('');
  const [formTitle, setFormTitle] = React.useState('');
  const [formCategory, setFormCategory] = React.useState<Category>('C# / .NET Core');
  const [formDifficulty, setFormDifficulty] = React.useState<Difficulty>('Senior');
  const [formText, setFormText] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formIdealAnswer, setFormIdealAnswer] = React.useState('');
  const [formCtoInsight, setFormCtoInsight] = React.useState('');
  
  // MCQ specific state
  const [hasChoices, setHasChoices] = React.useState(true);
  const [formChoices, setFormChoices] = React.useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = React.useState<number>(0);

  // Dynamic Glossary terms state
  const [formTerms, setFormTerms] = React.useState<KeyTerm[]>([{ term: '', explanation: '' }]);

  // Reference for file upload
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Toggle state to append instead of overwriting on JSON import
  const [shouldAppend, setShouldAppend] = React.useState(false);

  // Filtered List
  const filtered = React.useMemo(() => {
    return questions.filter(q => {
      const matchSearch = 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCat === 'All' || q.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [questions, searchTerm, selectedCat]);

  // Total pages
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedQuestions = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCat]);

  // Open Add Question
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormId(`CUSTOM-${Math.floor(100 + Math.random() * 900)}`);
    setFormTitle('');
    setFormCategory('C# / .NET Core');
    setFormDifficulty('Senior');
    setFormText('');
    setFormCode('');
    setFormIdealAnswer('');
    setFormCtoInsight('');
    setHasChoices(true);
    setFormChoices(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormTerms([{ term: '', explanation: '' }]);
    setIsModalOpen(true);
  };

  // Open Edit Question
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormId(q.id);
    setFormTitle(q.title);
    setFormCategory(q.category);
    setFormDifficulty(q.difficulty);
    setFormText(q.text);
    setFormCode(q.codeSnippet || '');
    setFormIdealAnswer(q.idealAnswer);
    setFormCtoInsight(q.ctoInsight);
    
    if (q.choices && q.choices.length > 0) {
      setHasChoices(true);
      setFormChoices([...q.choices]);
      setFormCorrectIndex(q.answerIndex || 0);
    } else {
      setHasChoices(false);
      setFormChoices(['', '', '', '']);
      setFormCorrectIndex(0);
    }

    if (q.keyTerms && q.keyTerms.length > 0) {
      setFormTerms([...q.keyTerms]);
    } else {
      setFormTerms([{ term: '', explanation: '' }]);
    }
    
    setIsModalOpen(true);
  };

  // Add/Remove choice rows
  const handleChoiceChange = (idx: number, val: string) => {
    const newChoices = [...formChoices];
    newChoices[idx] = val;
    setFormChoices(newChoices);
  };

  const handleAddChoiceRow = () => {
    setFormChoices([...formChoices, '']);
  };

  const handleRemoveChoiceRow = (idx: number) => {
    if (formChoices.length > 2) {
      setFormChoices(formChoices.filter((_, i) => i !== idx));
      if (formCorrectIndex >= formChoices.length - 1) {
        setFormCorrectIndex(0);
      }
    }
  };

  // Add/Remove key term rows
  const handleTermChange = (idx: number, field: keyof KeyTerm, val: string) => {
    const newTerms = [...formTerms];
    newTerms[idx] = { ...newTerms[idx], [field]: val };
    setFormTerms(newTerms);
  };

  const handleAddTermRow = () => {
    setFormTerms([...formTerms, { term: '', explanation: '' }]);
  };

  const handleRemoveTermRow = (idx: number) => {
    setFormTerms(formTerms.filter((_, i) => i !== idx));
  };

  // Submit Question Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formId.trim() || !formTitle.trim() || !formText.trim() || !formIdealAnswer.trim() || !formCtoInsight.trim()) {
      alert('Fill in all required fields (ID, Title, Problem Text, Ideal Answer, and CTO Insight).');
      return;
    }

    // Filter choices and terms
    const finalChoices = hasChoices ? formChoices.filter(c => c.trim() !== '') : undefined;
    const finalTerms = formTerms.filter(t => t.term.trim() !== '' && t.explanation.trim() !== '');

    const newQuestion: Question = {
      id: formId.trim(),
      category: formCategory,
      title: formTitle.trim(),
      difficulty: formDifficulty,
      text: formText.trim(),
      codeSnippet: formCode.trim() || undefined,
      idealAnswer: formIdealAnswer.trim(),
      ctoInsight: formCtoInsight.trim(),
      choices: finalChoices,
      answerIndex: hasChoices ? formCorrectIndex : undefined,
      keyTerms: finalTerms
    };

    try {
      await onAddQuestion(newQuestion);
      setIsModalOpen(false);
      alert('Question saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving question. Ensure the ID is unique.');
    }
  };

  // File Upload trigger
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        
        // Brief check
        JSON.parse(text);

        const confirmMsg = shouldAppend
          ? 'Importing this JSON will ADD new questions and update existing ones (matching IDs) without clearing the database. Proceed?'
          : 'Importing this JSON will OVERWRITE your active reviewer database questions (current questions will be deleted). Proceed?';

        const confirm = window.confirm(confirmMsg);
        if (!confirm) {
          e.target.value = '';
          return;
        }

        await onImportDb(text, shouldAppend);
        alert(shouldAppend ? 'Questions appended successfully!' : 'Database restored from backup successfully!');
      } catch (err) {
        alert('Failed to parse file. Ensure it is a valid reviewer JSON backup.');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = async () => {
    const confirm = window.confirm('WARNING: This will wipe all current custom questions and restore the database to the default 350+ CTO questions. This action is irreversible. Proceed?');
    if (confirm) {
      await onResetDb();
      alert('Database reset to factory default successfully!');
    }
  };

  const categoriesList: Category[] = [
    'C# / .NET Core', 'Multi Tenant', 'APIs, ORM & SQL', 'React / Angular', 'Azure & CI/CD', 'AI-First Dev', 'Security'
  ];

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h1 className="reviewer-card-title" style={{ marginBottom: '8px' }}>Database & Content Console</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
        Search, edit, add, or backup the database. Changes are persisted locally inside the browser's IndexedDB.
      </p>

      {/* Action panel */}
      <div className="db-actions-row">
        
        {/* Search & filters */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID, title, or scenario text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '14px', top: '12px' }} />
          </div>
          
          <select
            className="form-input"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as Category | 'All')}
            style={{ width: '180px' }}
          >
            <option value="All">All Domains</option>
            {categoriesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Database Action Buttons */}
        <div className="db-buttons">
          <button className="btn btn-secondary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Question
          </button>
          
          <button className="btn btn-secondary" onClick={onExportDb} title="Backup Database to JSON">
            <Download size={16} /> Export
          </button>

          <button className="btn btn-secondary" onClick={handleImportClick} title="Restore Database from JSON">
            <Upload size={16} /> Import
          </button>

          <label style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '13px', 
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.01)',
            transition: 'var(--transition-fast)'
          }} className="checkbox-append-label">
            <input 
              type="checkbox" 
              checked={shouldAppend}
              onChange={(e) => setShouldAppend(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
            />
            <span>Append questions</span>
          </label>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".json"
          />

          <button 
            className="btn btn-danger" 
            onClick={handleConfirmReset} 
            title="Reset Database to 350 Curated Questions"
            style={{ padding: '10px 16px' }}
          >
            <RefreshCw size={16} /> Reset DB
          </button>
        </div>

      </div>

      {/* Questions Data Grid */}
      <div className="q-table-wrapper">
        <table className="q-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Domain</th>
              <th>Tier</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuestions.map((q) => (
              <tr key={q.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{q.id}</td>
                <td style={{ fontWeight: '500' }}>{q.title}</td>
                <td>{q.category}</td>
                <td>{q.difficulty}</td>
                <td>{q.choices && q.choices.length > 0 ? 'MCQ' : 'Open Study'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      className="action-icon-btn" 
                      onClick={() => handleOpenEdit(q)}
                      title="Edit Question Details"
                    >
                      <Edit size={15} />
                    </button>
                    <button 
                      className="action-icon-btn btn-delete" 
                      onClick={() => onDeleteQuestion(q.id)}
                      title="Delete Question"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedQuestions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No questions found in database matching selection parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination-row">
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing page {currentPage} of {totalPages} ({filtered.length} total items)
          </span>
          <div className="pagination-controls">
            <button 
              className="page-num-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              &lt;
            </button>
            
            {/* Show a max of 5 page buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page = currentPage;
              if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              
              if (page > 0 && page <= totalPages) {
                return (
                  <button
                    key={page}
                    className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            <button 
              className="page-num-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingQuestion ? `Modify Scenario Context [${formId}]` : 'Create New Assessment Scenario'}
              </h2>
              <button className="action-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                
                {/* Meta details grid */}
                <div className="form-grid-2">
                  <div className="form-control">
                    <label className="form-label">Scenario ID (Unique Alphanumeric)*</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                      disabled={!!editingQuestion}
                      placeholder="e.g. CNET-51"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="form-label">Scenario Title*</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., ArrayPool buffer leaks"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="form-label">Domain Scope*</label>
                    <select
                      className="form-input"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Category)}
                    >
                      {categoriesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="form-label">Target Assessment Tier*</label>
                    <select
                      className="form-input"
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as Difficulty)}
                    >
                      <option value="Junior">Junior Developer</option>
                      <option value="Senior">Senior Developer</option>
                      <option value="Lead">Lead Architect</option>
                    </select>
                  </div>
                </div>

                {/* Problem text */}
                <div className="form-control">
                  <label className="form-label">Problem Scenario / Question Text*</label>
                  <textarea
                    className="form-input"
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Describe the architectural scenario or problem in detail..."
                    required
                  />
                </div>

                {/* Code snippet */}
                <div className="form-control">
                  <label className="form-label">Sample Code Snippet (Optional C# / SQL / TS)</label>
                  <textarea
                    className="form-input"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    style={{ minHeight: '120px', fontFamily: 'var(--font-mono)', fontSize: '12px', resize: 'vertical' }}
                    placeholder="Write or paste your code snippet here..."
                  />
                </div>

                {/* Question Type Choice (MCQ Toggle) */}
                <div className="form-control">
                  <div className="category-checkbox-label" style={{ display: 'inline-flex', width: 'fit-content' }} onClick={() => setHasChoices(!hasChoices)}>
                    <input type="checkbox" checked={hasChoices} readOnly />
                    <strong>Create as Multiple-Choice Question (MCQ) for Mock Exam</strong>
                  </div>
                </div>

                {/* Choice list inputs if checked */}
                {hasChoices && (
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="form-label" style={{ margin: 0 }}>Multiple-Choice Options</span>
                      <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={handleAddChoiceRow}>
                        + Add Choice Row
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formChoices.map((choice, cIdx) => (
                        <div key={cIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="correctChoice"
                            checked={formCorrectIndex === cIdx}
                            onChange={() => setFormCorrectIndex(cIdx)}
                            title="Mark as correct answer"
                          />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                            {String.fromCharCode(65 + cIdx)}.
                          </span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, padding: '8px 12px' }}
                            value={choice}
                            onChange={(e) => handleChoiceChange(cIdx, e.target.value)}
                            placeholder={`Enter choice text for option ${String.fromCharCode(65 + cIdx)}`}
                            required={hasChoices}
                          />
                          <button
                            type="button"
                            className="action-icon-btn btn-delete"
                            onClick={() => handleRemoveChoiceRow(cIdx)}
                            disabled={formChoices.length <= 2}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key answer rubric */}
                <div className="form-control">
                  <label className="form-label">Ideal Candidate Response / Grading Benchmarks*</label>
                  <textarea
                    className="form-input"
                    value={formIdealAnswer}
                    onChange={(e) => setFormIdealAnswer(e.target.value)}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Provide the key technical bullet points a high-caliber candidate should state..."
                    required
                  />
                </div>

                {/* CTO critique */}
                <div className="form-control">
                  <label className="form-label">60-Year CTO Interview Advice & Insights*</label>
                  <textarea
                    className="form-input"
                    value={formCtoInsight}
                    onChange={(e) => setFormCtoInsight(e.target.value)}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Add expert commentary on how to evaluate junior vs senior responses..."
                    required
                  />
                </div>

                {/* Glossary terms list */}
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="form-label" style={{ margin: 0 }}>Spotlight Technical Terms (Glossary definitions)</span>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={handleAddTermRow}>
                      + Add Term Card
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formTerms.map((termObj, tIdx) => (
                      <div key={tIdx} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={termObj.term}
                          onChange={(e) => handleTermChange(tIdx, 'term', e.target.value)}
                          placeholder="Term (e.g. CSRF)"
                        />
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '8px 12px' }}
                          value={termObj.explanation}
                          onChange={(e) => handleTermChange(tIdx, 'explanation', e.target.value)}
                          placeholder="CTO definition / explanation..."
                        />
                        <button
                          type="button"
                          className="action-icon-btn btn-delete"
                          onClick={() => handleRemoveTermRow(tIdx)}
                          disabled={formTerms.length === 1 && termObj.term === ''}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Scenario File
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
