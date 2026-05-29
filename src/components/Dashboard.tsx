import React from 'react';
import type { Question, UserProgress, Category } from '../types';
import { BookOpen, CheckCircle, HelpCircle, Trophy } from 'lucide-react';

interface DashboardProps {
  questions: Question[];
  progress: UserProgress[];
  setCurrentTab: (tab: string) => void;
  setSelectedCategory: (cat: Category | '') => void;
}

export default function Dashboard({ questions, progress, setCurrentTab, setSelectedCategory }: DashboardProps) {
  // Aggregate stats
  const totalQuestions = questions.length;
  
  const progressMap = React.useMemo(() => {
    const map = new Map<string, string>();
    progress.forEach(p => map.set(p.questionId, p.status));
    return map;
  }, [progress]);

  const stats = React.useMemo(() => {
    let mastered = 0;
    let review = 0;
    let struggled = 0;
    let unstarted = 0;

    questions.forEach(q => {
      const status = progressMap.get(q.id) || 'unstarted';
      if (status === 'mastered') mastered++;
      else if (status === 'review') review++;
      else if (status === 'struggled') struggled++;
      else unstarted++;
    });

    return { mastered, review, struggled, unstarted };
  }, [questions, progressMap]);

  // Aggregate category stats
  const categories: Category[] = [
    'C# / .NET Core',
    'Multi Tenant',
    'APIs, ORM & SQL',
    'React / Angular',
    'Azure & CI/CD',
    'AI-First Dev',
    'Security'
  ];

  const catStats = React.useMemo(() => {
    return categories.map(cat => {
      const catQuestions = questions.filter(q => q.category === cat);
      const total = catQuestions.length;
      
      let mastered = 0;
      let review = 0;
      let struggled = 0;
      let unstarted = 0;

      catQuestions.forEach(q => {
        const status = progressMap.get(q.id) || 'unstarted';
        if (status === 'mastered') mastered++;
        else if (status === 'review') review++;
        else if (status === 'struggled') struggled++;
        else unstarted++;
      });

      const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

      return {
        category: cat,
        total,
        mastered,
        review,
        struggled,
        unstarted,
        percent
      };
    });
  }, [questions, progressMap]);

  // Dynamic CTO Commentary
  const ctoFeedback = React.useMemo(() => {
    const masteredRatio = totalQuestions > 0 ? stats.mastered / totalQuestions : 0;
    const struggledRatio = totalQuestions > 0 ? stats.struggled / totalQuestions : 0;

    if (totalQuestions === 0) {
      return {
        title: "Database is Empty",
        text: "It seems the database is currently empty. Go to the Database Console to reset it to the default CTO-curated question pool!"
      };
    }

    if (progress.length === 0) {
      return {
        title: "Welcome to the Atlas Senior Assessment!",
        text: "I've been building and reviewing enterprise architectures for over 60 years, and I can tell you: don't be fooled by simple coding questions. The Atlas platform demands absolute zero-allocation C# parsing, airtight multi-tenant separation, and rigorous security verification. Start by exploring the 'Study Reviewer' to test your chops."
      };
    }

    if (struggledRatio > 0.15) {
      return {
        title: "System Instability Warning",
        text: "I see you're struggling on a significant chunk of these scenarios. In a high-density, multi-tenant SaaS application, a single poorly-optimized EF query or memory leak will drag the entire cloud infrastructure down. Spend more time looking at the 'CTO Insights' inside the Study Reviewer. We need architects, not just coders."
      };
    }

    if (masteredRatio > 0.8) {
      return {
        title: "Architect Grade Achieved!",
        text: "Incredible. You have mastered the hot-path micro-allocations, database sharding routers, and zero-trust Azure Managed Identities. Your profile represents the absolute top 1% of .NET developers. I highly recommend running the 'Mock Exam' immediately to prove you can perform under timed pressure."
      };
    }

    if (masteredRatio > 0.4) {
      return {
        title: "Steady Progress, Developer",
        text: "You are getting the hang of it! Your C# and Azure integration knowledge is becoming respectable. However, pay extreme attention to the 'AI-First Dev' section. Cursor rules optimization and Devin task orchestration aren't just buzzwords on our team—they are how we deploy robust, complex subsystems three times faster. Keep pushing."
      };
    }

    return {
      title: "CTO's Initial Diagnostic",
      text: "You've started reviewed a few scenarios. Good. But remember: senior developers don't just write clean code; they understand the complete architectural footprint of their actions. Why does ValueTask outperform Task in synchronous hot paths? Why are EF Core global query filters essential? Always ask 'Why'."
    };
  }, [stats, totalQuestions, progress]);

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setCurrentTab('reviewer');
  };

  return (
    <div className="dashboard-grid">
      {/* LEFT COLUMN: Main Stats & Progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* CTO Greeting Panel */}
        <div className="glass-panel cto-greeting-box">
          <div className="cto-avatar-container">
            <div className="cto-avatar">CTO</div>
            <div className="cto-role-badge">60+ YRS</div>
          </div>
          <div className="cto-bubble">
            <h3 className="cto-bubble-title">{ctoFeedback.title}</h3>
            <p className="cto-bubble-text">"{ctoFeedback.text}"</p>
          </div>
        </div>

        {/* Core Stats Tiles */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="card-title"><Trophy size={20} className="text-gradient" /> Overall Progression</h2>
          <div className="stats-grid">
            <div className="stat-item" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="stat-value text-gradient">{totalQuestions}</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-item" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{stats.mastered}</div>
              <div className="stat-label">Mastered</div>
            </div>
            <div className="stat-item" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
              <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{stats.review}</div>
              <div className="stat-label">Needs Review</div>
            </div>
            <div className="stat-item" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
              <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>{stats.struggled}</div>
              <div className="stat-label">Struggled</div>
            </div>
          </div>
        </div>

        {/* Category-by-Category Progress List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="card-title"><BookOpen size={20} className="text-gradient" /> Assessment Breakdown</h2>
          <div className="cat-progress-list">
            {catStats.map((cat) => (
              <div 
                key={cat.category} 
                className="cat-progress-item glass-panel" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleCategoryClick(cat.category)}
              >
                <div className="cat-progress-header">
                  <span className="cat-name">{cat.category}</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className="cat-percent">{cat.percent}% Mastered</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({cat.mastered}/{cat.total})
                    </span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${cat.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Quick Links / Guidelines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Core Guidelines */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="card-title"><CheckCircle size={20} className="text-gradient" /> Target Job Profile</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            This technical reviewer assessment tests candidates against the elite <strong>Atlas SaaS Platform</strong> engineering requirements:
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>5+ Years .NET Core:</strong> Must demonstrate low-level stack manipulation, ValueTypes, Span, and LOH tuning.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>SaaS Multi-Tenancy:</strong> DB segregation, connection pooling boundaries, tenant-wise caching isolation.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>AI-First Engineering:</strong> Direct agentic task delegators for Claude, Devin pipelines, and Cursor custom rules.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Zero-Trust Azure:</strong> Managed Identity structures, Bicep deployment templates, and OIDC pipelines.
            </li>
          </ul>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => setCurrentTab('reviewer')}
          >
            Launch Reviewer Mode
          </button>
        </div>

        {/* Diagnostic Action Help */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 className="card-title"><HelpCircle size={20} className="text-gradient" /> System Instructions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <p>
              1. Use <strong style={{ color: 'var(--text-primary)' }}>Study Reviewer</strong> to deep-dive into each technical scenario, inspect code snippets, and review terms.
            </p>
            <p>
              2. Self-evaluate your mastery state using the green, yellow, and red status tags to update your dashboard analytics.
            </p>
            <p>
              3. Trigger custom <strong style={{ color: 'var(--text-primary)' }}>Mock Exams</strong> under active countdown limits to practice real multiple-choice assessments.
            </p>
            <p>
              4. Need to add custom team interview questions? Navigate to the <strong style={{ color: 'var(--text-primary)' }}>Database Console</strong> to insert, edit, or back up files.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
