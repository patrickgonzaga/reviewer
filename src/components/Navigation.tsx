import { LayoutDashboard, BookOpen, Award, Database, BookMarked, Code } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Navigation({ currentTab, setCurrentTab }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reviewer', label: 'Study Reviewer', icon: BookOpen },
    { id: 'exam', label: 'Mock Exam', icon: Award },
    { id: 'dbmanager', label: 'Database Console', icon: Database },
    { id: 'glossary', label: 'CTO Glossary', icon: BookMarked },
  ];

  return (
    <header className="nav-header">
      <div className="nav-brand" onClick={() => setCurrentTab('dashboard')}>
        <Code className="nav-logo" size={32} />
        <div className="nav-title">
          <span>ATLAS REVIEWER</span>
          <span className="nav-subtitle">Senior .NET Assessment</span>
        </div>
      </div>
      
      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-btn ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
