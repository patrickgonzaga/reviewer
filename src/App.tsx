import React from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Reviewer from './components/Reviewer';
import Exam from './components/Exam';
import DbManager from './components/DbManager';
import Glossary from './components/Glossary';

import type { Question, UserProgress, ExamSession, Category, EvaluationStatus } from './types';
import { 
  initDB, 
  getAllQuestions, 
  getAllProgress, 
  saveProgress, 
  saveQuestion, 
  deleteQuestion, 
  resetDatabaseToDefault, 
  importDatabase, 
  exportDatabase,
  saveExamSession 
} from './db/indexedDB';

export default function App() {
  const [db, setDb] = React.useState<IDBDatabase | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [progress, setProgress] = React.useState<UserProgress[]>([]);
  
  // Routing & Shared Category Filter state
  const [currentTab, setCurrentTab] = React.useState<string>('dashboard');
  const [selectedCategory, setSelectedCategory] = React.useState<Category | ''>('');
  const [loading, setLoading] = React.useState<boolean>(true);

  // Initialize Database on mount
  React.useEffect(() => {
    async function loadDatabase() {
      try {
        const activeDb = await initDB();
        setDb(activeDb);

        // Fetch initial data
        const loadedQuestions = await getAllQuestions(activeDb);
        const loadedProgress = await getAllProgress(activeDb);

        setQuestions(loadedQuestions);
        setProgress(loadedProgress);
      } catch (err) {
        console.error('Failed to initialize local IndexedDB database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDatabase();
  }, []);

  // Handler: Update evaluation status of a question
  const handleSaveProgress = async (questionId: string, status: EvaluationStatus) => {
    if (!db) return;

    const newProgressItem: UserProgress = {
      questionId,
      status,
      lastReviewedAt: new Date().toISOString()
    };

    try {
      await saveProgress(db, newProgressItem);
      
      // Update local state array
      setProgress(prev => {
        const filtered = prev.filter(p => p.questionId !== questionId);
        return [...filtered, newProgressItem];
      });
    } catch (err) {
      console.error('Failed to save self-evaluation status:', err);
    }
  };

  // Handler: Create or Edit a question
  const handleAddQuestion = async (q: Question) => {
    if (!db) return;
    try {
      await saveQuestion(db, q);
      
      // Reload questions
      const updated = await getAllQuestions(db);
      setQuestions(updated);
    } catch (err) {
      throw err; // bubble error to form for visual alert
    }
  };

  // Handler: Delete a question
  const handleDeleteQuestion = async (id: string) => {
    if (!db) return;
    const confirm = window.confirm(`Are you sure you want to delete question [${id}]?`);
    if (!confirm) return;

    try {
      await deleteQuestion(db, id);
      
      // Update local states
      setQuestions(prev => prev.filter(q => q.id !== id));
      setProgress(prev => prev.filter(p => p.questionId !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  // Handler: Factory reset database
  const handleResetDb = async () => {
    if (!db) return;
    try {
      setLoading(true);
      await resetDatabaseToDefault(db);
      
      // Reload
      const loadedQuestions = await getAllQuestions(db);
      const loadedProgress = await getAllProgress(db);

      setQuestions(loadedQuestions);
      setProgress(loadedProgress);
    } catch (err) {
      console.error('Failed to factory reset database:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Import full backup
  const handleImportDb = async (jsonString: string) => {
    if (!db) return;
    try {
      setLoading(true);
      await importDatabase(db, jsonString);

      // Reload
      const loadedQuestions = await getAllQuestions(db);
      const loadedProgress = await getAllProgress(db);

      setQuestions(loadedQuestions);
      setProgress(loadedProgress);
    } catch (err) {
      console.error('Failed to import database:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handler: Export Backup JSON as browser download
  const handleExportDb = async () => {
    if (!db) return;
    try {
      const backupString = await exportDatabase(db);
      const blob = new Blob([backupString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cto-dotnet-reviewer-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export database backup:', err);
    }
  };

  // Handler: Save Completed Exam Session
  const handleSaveExamSession = async (session: ExamSession) => {
    if (!db) return;
    try {
      await saveExamSession(db, session);
    } catch (err) {
      console.error('Failed to log exam session:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(0, 242, 254, 0.1)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'pulseTimer 1s infinite alternate' }}></div>
        <h2 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Loading Atlas Database Environment...
        </h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Universal Navigation Header */}
      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Router Viewport */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <Dashboard 
            questions={questions} 
            progress={progress} 
            setCurrentTab={setCurrentTab} 
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentTab === 'reviewer' && (
          <Reviewer 
            questions={questions} 
            progress={progress} 
            onSaveProgress={handleSaveProgress}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentTab === 'exam' && (
          <Exam 
            questions={questions} 
            onSaveExamSession={handleSaveExamSession}
          />
        )}

        {currentTab === 'dbmanager' && (
          <DbManager 
            questions={questions} 
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onResetDb={handleResetDb}
            onImportDb={handleImportDb}
            onExportDb={handleExportDb}
          />
        )}

        {currentTab === 'glossary' && (
          <Glossary 
            questions={questions}
          />
        )}
      </main>
    </div>
  );
}
