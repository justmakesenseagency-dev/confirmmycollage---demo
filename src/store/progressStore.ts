import { create } from 'zustand';
import { StorageService } from '../services/storage';
import { Question, MockTestAttempt } from '../types';

interface SolvedRecord {
  isCorrect: boolean;
  selectedOption: number;
  solvedAt: string;
}

interface ProgressData {
  bookmarkedQuestions: string[];
  solvedQuestions: Record<string, SolvedRecord>;
  lastPracticeDate: string;
  streak: number;
}

interface ProgressStore {
  bookmarkedQuestions: string[];
  solvedQuestions: Record<string, SolvedRecord>;
  streak: number;
  aiQuestions: Question[];
  mockAttempts: MockTestAttempt[];

  toggleBookmarkQuestion: (questionId: string) => void;
  isQuestionBookmarked: (questionId: string) => boolean;
  markQuestionSolved: (questionId: string, selectedOption: number, isCorrect: boolean) => void;
  addAiQuestions: (questions: Question[]) => void;
  recordMockAttempt: (attempt: MockTestAttempt) => void;
}

const defaultProgress: ProgressData = {
  bookmarkedQuestions: [],
  solvedQuestions: {},
  lastPracticeDate: '',
  streak: 3, // starting friendly streak for demonstration
};

const loadedProgress = StorageService.getQuestionProgress<ProgressData>(defaultProgress);
const loadedAiQuestions = StorageService.getAiQuestions<Question[]>([]);
const loadedMockAttempts = StorageService.getMockAttempts<MockTestAttempt[]>([]);

export const useProgressStore = create<ProgressStore>((set, get) => ({
  bookmarkedQuestions: loadedProgress.bookmarkedQuestions,
  solvedQuestions: loadedProgress.solvedQuestions,
  streak: loadedProgress.streak,
  aiQuestions: loadedAiQuestions,
  mockAttempts: loadedMockAttempts,

  toggleBookmarkQuestion: (questionId) => {
    const current = get().bookmarkedQuestions;
    const exists = current.includes(questionId);
    const updated = exists ? current.filter((id) => id !== questionId) : [...current, questionId];
    set({ bookmarkedQuestions: updated });
    StorageService.setQuestionProgress({
      bookmarkedQuestions: updated,
      solvedQuestions: get().solvedQuestions,
      lastPracticeDate: loadedProgress.lastPracticeDate,
      streak: get().streak,
    });
  },

  isQuestionBookmarked: (questionId) => {
    return get().bookmarkedQuestions.includes(questionId);
  },

  markQuestionSolved: (questionId, selectedOption, isCorrect) => {
    const today = new Date().toISOString().split('T')[0];
    const prevDate = loadedProgress.lastPracticeDate;
    let newStreak = get().streak;

    if (prevDate !== today) {
      newStreak = prevDate ? newStreak + 1 : 1;
    }

    const updatedSolved = {
      ...get().solvedQuestions,
      [questionId]: {
        isCorrect,
        selectedOption,
        solvedAt: new Date().toISOString(),
      },
    };

    set({ solvedQuestions: updatedSolved, streak: newStreak });
    StorageService.setQuestionProgress({
      bookmarkedQuestions: get().bookmarkedQuestions,
      solvedQuestions: updatedSolved,
      lastPracticeDate: today,
      streak: newStreak,
    });
  },

  addAiQuestions: (newQuestions) => {
    const updated = [...get().aiQuestions, ...newQuestions];
    set({ aiQuestions: updated });
    StorageService.setAiQuestions(updated);
  },

  recordMockAttempt: (attempt) => {
    const updated = [attempt, ...get().mockAttempts];
    set({ mockAttempts: updated });
    StorageService.setMockAttempts(updated);
  },
}));
