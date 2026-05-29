import React from 'react';
import type { Question } from '../types';
import { Search, BookMarked, HelpCircle, FileText } from 'lucide-react';

interface GlossaryProps {
  questions: Question[];
}

interface AggregatedTerm {
  term: string;
  explanation: string;
  category: string;
  questionsReferencing: string[];
}

export default function Glossary({ questions }: GlossaryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Dynamically extract all key terms from active questions
  const aggregatedTerms = React.useMemo(() => {
    const termMap = new Map<string, AggregatedTerm>();

    questions.forEach(q => {
      if (q.keyTerms && Array.isArray(q.keyTerms)) {
        q.keyTerms.forEach(kt => {
          const normalizedKey = kt.term.trim().toLowerCase();
          
          if (termMap.has(normalizedKey)) {
            const existing = termMap.get(normalizedKey)!;
            // Append referencing question if not present
            if (!existing.questionsReferencing.includes(q.id)) {
              existing.questionsReferencing.push(q.id);
            }
          } else {
            termMap.set(normalizedKey, {
              term: kt.term.trim(),
              explanation: kt.explanation.trim(),
              category: q.category,
              questionsReferencing: [q.id]
            });
          }
        });
      }
    });

    // Convert map to array and sort alphabetically by term
    return Array.from(termMap.values()).sort((a, b) => a.term.localeCompare(b.term));
  }, [questions]);

  // Filtered terms based on search input
  const filteredTerms = React.useMemo(() => {
    return aggregatedTerms.filter(t => 
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [aggregatedTerms, searchTerm]);

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h1 className="reviewer-card-title" style={{ marginBottom: '8px' }}>
        <BookMarked size={28} className="text-gradient" /> Technical Terminology Glossary
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
        A dynamically generated technical dictionary of all technical jargon spotlighted across the {questions.length} active database scenarios.
      </p>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '32px', maxWidth: '500px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search glossary terms or definitions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <Search size={18} className="text-muted" style={{ position: 'absolute', left: '14px', top: '12px' }} />
      </div>

      {/* Terms Grid */}
      <div className="glossary-grid">
        {filteredTerms.map((t, idx) => (
          <div key={idx} className="glossary-card glass-panel">
            <div className="glossary-header">
              <span className="glossary-term">{t.term}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
                {t.category.split(' ')[0]} {/* Short category name */}
              </span>
            </div>
            
            <p className="glossary-desc" style={{ flex: 1 }}>{t.explanation}</p>

            {/* Referencing IDs */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <FileText size={12} />
              <span>References:</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {t.questionsReferencing.map(id => (
                  <span 
                    key={id} 
                    style={{ 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--text-cyan)',
                      fontSize: '10px'
                    }}
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <HelpCircle size={36} className="text-muted" style={{ margin: '0 auto 12px auto' }} />
            <h3>No terminology matches found</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Check your spelling or reset the database in the console to repopulate core terms.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
