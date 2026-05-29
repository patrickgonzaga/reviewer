import type { Question, UserProgress, ExamSession } from '../types';
import { defaultQuestions } from './defaultQuestions';

const DB_NAME = 'CTODotNetReviewerDB';
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      
      // Store for all reviewer questions
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id' });
      }
      
      // Store for tracking user self-evaluation progress per question
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'questionId' });
      }
      
      // Store for exam histories
      if (!db.objectStoreNames.contains('exams')) {
        db.createObjectStore('exams', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      
      // Seed database with default questions if empty
      const transaction = db.transaction('questions', 'readonly');
      const store = transaction.objectStore('questions');
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
          seedDefaultQuestions(db).then(() => {
            resolve(db);
          }).catch((err) => {
            reject(err);
          });
        } else {
          resolve(db);
        }
      };

      countRequest.onerror = () => {
        reject(countRequest.error);
      };
    };

    request.onerror = () => reject(request.error);
  });
}

function seedDefaultQuestions(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('questions', 'readwrite');
    const store = transaction.objectStore('questions');

    defaultQuestions.forEach((q) => {
      store.put(q);
    });

    transaction.oncomplete = () => {
      console.log('Successfully seeded default questions database!');
      resolve();
    };

    transaction.onerror = () => {
      console.error('Failed to seed default questions:', transaction.error);
      reject(transaction.error);
    };
  });
}

// QUESTIONS CRUD
export async function getAllQuestions(db: IDBDatabase): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('questions', 'readonly');
    const store = transaction.objectStore('questions');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveQuestion(db: IDBDatabase, question: Question): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('questions', 'readwrite');
    const store = transaction.objectStore('questions');
    const request = store.put(question);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteQuestion(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['questions', 'progress'], 'readwrite');
    
    // Delete question
    const questionStore = transaction.objectStore('questions');
    questionStore.delete(id);

    // Delete associated progress if any
    const progressStore = transaction.objectStore('progress');
    progressStore.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function resetDatabaseToDefault(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['questions', 'progress', 'exams'], 'readwrite');
    
    const questionsStore = transaction.objectStore('questions');
    const progressStore = transaction.objectStore('progress');
    const examsStore = transaction.objectStore('exams');

    questionsStore.clear();
    progressStore.clear();
    examsStore.clear();

    defaultQuestions.forEach((q) => {
      questionsStore.put(q);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// PROGRESS METRICS
export async function getAllProgress(db: IDBDatabase): Promise<UserProgress[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('progress', 'readonly');
    const store = transaction.objectStore('progress');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProgress(db: IDBDatabase, progress: UserProgress): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('progress', 'readwrite');
    const store = transaction.objectStore('progress');
    const request = store.put(progress);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// EXAMS
export async function getAllExams(db: IDBDatabase): Promise<ExamSession[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('exams', 'readonly');
    const store = transaction.objectStore('exams');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveExamSession(db: IDBDatabase, session: ExamSession): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('exams', 'readwrite');
    const store = transaction.objectStore('exams');
    const request = store.put(session);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearExamHistory(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('exams', 'readwrite');
    const store = transaction.objectStore('exams');
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// PORTABILITY
export async function exportDatabase(db: IDBDatabase): Promise<string> {
  const questions = await getAllQuestions(db);
  const progress = await getAllProgress(db);
  const exams = await getAllExams(db);

  return JSON.stringify({
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    questions,
    progress,
    exams
  }, null, 2);
}

export async function importDatabase(db: IDBDatabase, jsonString: string, append: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid backup file format: missing questions list.');
      }

      const transaction = db.transaction(['questions', 'progress', 'exams'], 'readwrite');
      
      const questionsStore = transaction.objectStore('questions');
      const progressStore = transaction.objectStore('progress');
      const examsStore = transaction.objectStore('exams');

      if (!append) {
        questionsStore.clear();
        if (data.clearProgress) {
          progressStore.clear();
        }
        if (data.clearExams) {
          examsStore.clear();
        }
      }

      // Import questions
      data.questions.forEach((q: Question) => {
        questionsStore.put(q);
      });

      // Import progress if present
      if (data.progress && Array.isArray(data.progress)) {
        data.progress.forEach((p: UserProgress) => {
          progressStore.put(p);
        });
      }

      // Import exams if present
      if (data.exams && Array.isArray(data.exams)) {
        data.exams.forEach((e: ExamSession) => {
          examsStore.put(e);
        });
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    } catch (err) {
      reject(err);
    }
  });
}
