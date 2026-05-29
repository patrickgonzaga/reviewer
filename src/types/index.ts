export type Category = 
  | 'C# / .NET Core'
  | 'Multi Tenant'
  | 'APIs, ORM & SQL'
  | 'React / Angular'
  | 'Azure & CI/CD'
  | 'AI-First Dev'
  | 'Security';

export type Difficulty = 'Junior' | 'Senior' | 'Lead';

export type EvaluationStatus = 'unstarted' | 'mastered' | 'review' | 'struggled';

export interface KeyTerm {
  term: string;
  explanation: string;
}

export interface Question {
  id: string; // alphanumeric ID e.g., 'CNET-01', 'MT-02'
  category: Category;
  title: string;
  difficulty: Difficulty;
  text: string;
  choices?: string[]; // Optional: for multiple choice
  answerIndex?: number; // Optional: index of correct choice (0-indexed)
  idealAnswer: string; // The bullet-point rich standard answer
  ctoInsight: string; // High-level CTO perspective and review advice
  keyTerms: KeyTerm[];
  codeSnippet?: string; // Optional code block
}

export interface UserProgress {
  questionId: string;
  status: EvaluationStatus;
  notes?: string;
  lastReviewedAt?: string;
}

export interface ExamQuestionResult {
  questionId: string;
  selectedAnswerIndex?: number;
  isCorrect: boolean;
  userShortAnswer?: string;
}

export interface ExamSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  categories: Category[];
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercentage: number;
  durationSeconds: number;
  results: ExamQuestionResult[];
}

export interface SectionStats {
  category: Category;
  total: number;
  mastered: number;
  review: number;
  struggled: number;
  unstarted: number;
}
