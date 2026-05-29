# .NET Senior Developer Assessment & Study Platform

A sophisticated senior-level .NET developer assessment and study tool built with React, TypeScript, and Vite. Designed as a CTO-level interview preparation and self-assessment platform featuring 350+ premium technical scenarios across 7 key domains.

## 🎯 Project Overview

The **dot-net-reviewer** is an advanced study and assessment platform specifically designed for senior .NET developers preparing for technical leadership roles. It combines realistic enterprise scenarios with detailed architectural insights, code examples, and comprehensive explanations to bridge the gap between coding proficiency and architectural mastery.

### Key Features

- **📊 Interactive Dashboard**: Real-time progress tracking with CTO commentary and category breakdown
- **📖 Study Reviewer**: Comprehensive question viewer with advanced filtering, search, and self-evaluation
- **🎓 Mock Exam System**: Timed assessments with customizable parameters and detailed scoring
- **🗄️ Database Console**: Full question management with import/export and reset functionality
- **📚 Technical Glossary**: Dynamic terminology dictionary with cross-references
- **💾 Local Storage**: Browser-based IndexedDB for offline access and data persistence
- **🎨 Premium UI**: Glassmorphism design with smooth animations and responsive layout

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8 for fast development and optimized production builds
- **Database**: IndexedDB (browser-local storage)
- **Styling**: Custom CSS with glassmorphism design system
- **Icons**: Lucide React for consistent iconography
- **Development Tools**: ESLint with TypeScript support

### Project Structure

```
dot-net-reviewer/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx    # Main dashboard with progress tracking
│   │   ├── Reviewer.tsx     # Study mode with question viewer
│   │   ├── Exam.tsx         # Mock exam system
│   │   ├── DbManager.tsx    # Database management console
│   │   ├── Glossary.tsx     # Technical terminology dictionary
│   │   └── Navigation.tsx   # Main navigation header
│   ├── db/                # Database layer
│   │   ├── indexedDB.ts     # IndexedDB operations and seeding
│   │   └── defaultQuestions.ts # Default question pool (350+ questions)
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts         # Core data structures
│   ├── App.tsx            # Main application component
│   ├── App.css            # Component-specific styles
│   ├── index.css          # Global styles and design system
│   └── main.tsx           # Application entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # This file
```

## 📚 Assessment Categories

The platform covers 7 comprehensive domains, each containing 50+ carefully crafted scenarios:

1. **C# / .NET Core** - Memory management, async patterns, performance optimization
2. **Multi Tenant** - Architecture patterns, data isolation, context management
3. **APIs, ORM & SQL** - Entity Framework, query optimization, API design
4. **React / Angular** - Frontend architecture, state management, performance
5. **Azure & CI/CD** - Cloud services, deployment pipelines, infrastructure
6. **AI-First Dev** - AI-assisted development, tool integration, modern workflows
7. **Security** - Authentication, authorization, secure coding practices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dot-net-reviewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Running Production Build

```bash
npm run preview
```

## 🎮 Usage Guide

### Dashboard

The dashboard provides an overview of your study progress with:
- **CTO Commentary**: Dynamic feedback based on your performance
- **Category Breakdown**: Progress tracking by domain with visual progress bars
- **Quick Actions**: Direct access to study modes and specific categories

### Study Reviewer

The study mode allows you to:
- **Filter Questions**: By category, difficulty, and progress status
- **Search**: Full-text search across questions, titles, and IDs
- **Self-Evaluate**: Mark questions as mastered, needs review, or struggled
- **Detailed Explanations**: View ideal answers, CTO insights, code snippets, and key terms

### Mock Exam System

Configure and take timed assessments:
- **Customizable Parameters**: Select categories, question count, and time limits
- **Real-time Scoring**: Immediate feedback on performance
- **Detailed Results**: Review answers with explanations and letter grades

### Database Console

Manage your question database:
- **Add/Edit Questions**: Create custom scenarios or modify existing ones
- **Import/Export**: Backup and restore your progress and custom questions
- **Factory Reset**: Restore the database to default questions

### Technical Glossary

Browse technical terminology:
- **Auto-generated**: Dynamically built from question key terms
- **Searchable**: Find terms by name, definition, or category
- **Cross-referenced**: See which questions reference each term

## 🗄️ Database Architecture

### IndexedDB Schema

The application uses IndexedDB with the following object stores:

- **questions**: Stores all assessment questions with full metadata
- **progress**: Tracks user self-evaluation status per question
- **exams**: Stores completed exam session history

### Database Seeding

The database is automatically seeded with 350+ default questions on first launch. The seeding process:

1. Checks if the questions store is empty
2. If empty, populates with questions from `src/db/defaultQuestions.ts`
3. The `resetDatabaseToDefault()` function can be called to restore factory defaults

**Note**: When you reset the database, it will be reseeded with all questions from `defaultQuestions.ts`, including any new questions you've added to that file.

### Data Persistence

All data is stored locally in the browser's IndexedDB, providing:
- Offline access to questions and progress
- No server dependencies
- Fast local performance
- Privacy by default

## 📝 Question Format

Each question follows a comprehensive structure:

```typescript
{
  id: string;              // Unique identifier (e.g., 'CNET-01')
  category: Category;      // One of 7 assessment domains
  title: string;          // Descriptive question title
  difficulty: 'Senior' | 'Lead';
  text: string;          // Full problem scenario
  choices?: string[];     // Multiple choice options (optional)
  answerIndex?: number;   // Correct choice index (optional)
  idealAnswer: string;    // Detailed explanation
  ctoInsight: string;     // High-level architectural perspective
  keyTerms: KeyTerm[];    // Technical terminology with definitions
  codeSnippet?: string;   // Relevant code examples
}
```

## 🎨 Design System

The platform features a premium dark theme with:

- **Color Palette**: Slate dark base with cyan/emerald accent gradients
- **Glassmorphism**: Frosted glass panels with backdrop blur
- **Typography**: Outfit (headings) and JetBrains Mono (code)
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design with desktop enhancements

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally

## 📊 Progress Tracking

The application tracks your learning journey through:

- **Self-Evaluation Status**: mastered, review, struggled, unstarted
- **Category Progress**: Percentage completion by domain
- **CTO Feedback**: Dynamic commentary based on performance metrics
- **Exam History**: Record of all completed assessment sessions

## 🤝 Contributing

To add custom questions:

1. Use the Database Console to add questions via the UI, or
2. Modify `src/db/defaultQuestions.ts` directly for bulk additions
3. Reset the database to apply changes from defaultQuestions.ts

## 📄 License

This project is private and proprietary.

## 🎓 Target Audience

This platform is designed for:

- Senior .NET developers preparing for leadership roles
- Technical leads and architects seeking to validate their expertise
- Developers transitioning to senior-level positions
- Interviewers preparing technical assessments
- Teams conducting internal skill evaluations

## 💡 Key Differentiators

Unlike typical coding challenge platforms, this focuses on:

- **Architectural Thinking** over algorithmic puzzles
- **Real-world Scenarios** from enterprise environments
- **Multi-domain Knowledge** across the full development stack
- **CTO-level Insights** into decision-making processes
- **Practical Application** rather than theoretical knowledge

---

Built with ❤️ using React 19, TypeScript, and Vite