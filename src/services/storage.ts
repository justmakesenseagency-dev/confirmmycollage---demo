/**
 * Storage Service
 * Wraps all local persistence so components never access localStorage directly.
 * Allows effortless transition to Firebase Firestore or any cloud database later.
 */

const STORAGE_KEYS = {
  AUTH: 'cmc_auth_session',
  PROFILE: 'cmc_student_profile',
  APPLICATION: 'cmc_common_application',
  SHORTLIST: 'cmc_shortlisted_colleges',
  COMPARE: 'cmc_compare_colleges',
  QUESTION_PROGRESS: 'cmc_question_progress',
  MOCK_ATTEMPTS: 'cmc_mock_test_attempts',
  AI_QUESTIONS: 'cmc_ai_generated_questions',
  CONSENT: 'cmc_cookie_consent',
} as const;

export const StorageService = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error reading from storage for key ${key}:`, e);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to storage for key ${key}:`, e);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing from storage for key ${key}:`, e);
    }
  },

  // Auth
  getAuth<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.AUTH, defaultValue);
  },
  setAuth<T>(data: T): void {
    this.setItem(STORAGE_KEYS.AUTH, data);
  },

  // Profile
  getProfile<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.PROFILE, defaultValue);
  },
  setProfile<T>(data: T): void {
    this.setItem(STORAGE_KEYS.PROFILE, data);
  },

  // Application
  getApplication<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.APPLICATION, defaultValue);
  },
  setApplication<T>(data: T): void {
    this.setItem(STORAGE_KEYS.APPLICATION, data);
  },

  // Shortlist
  getShortlist(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.SHORTLIST, []);
  },
  setShortlist(colleges: string[]): void {
    this.setItem(STORAGE_KEYS.SHORTLIST, colleges);
  },

  // Compare
  getCompareList(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.COMPARE, []);
  },
  setCompareList(colleges: string[]): void {
    this.setItem(STORAGE_KEYS.COMPARE, colleges);
  },

  // Question Progress
  getQuestionProgress<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.QUESTION_PROGRESS, defaultValue);
  },
  setQuestionProgress<T>(data: T): void {
    this.setItem(STORAGE_KEYS.QUESTION_PROGRESS, data);
  },

  // Mock Test Attempts
  getMockAttempts<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.MOCK_ATTEMPTS, defaultValue);
  },
  setMockAttempts<T>(data: T): void {
    this.setItem(STORAGE_KEYS.MOCK_ATTEMPTS, data);
  },

  // AI Generated Questions
  getAiQuestions<T>(defaultValue: T): T {
    return this.getItem(STORAGE_KEYS.AI_QUESTIONS, defaultValue);
  },
  setAiQuestions<T>(data: T): void {
    this.setItem(STORAGE_KEYS.AI_QUESTIONS, data);
  },

  // Consent
  getConsent(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.CONSENT, false);
  },
  setConsent(consented: boolean): void {
    this.setItem(STORAGE_KEYS.CONSENT, consented);
  },

  // Clear all data (DPDP Act compliance)
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('Error clearing platform data:', e);
    }
  },

  // Export full user data package (DPDP Act right to portability)
  exportUserData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    try {
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            data[name] = JSON.parse(raw);
          } catch {
            data[name] = raw;
          }
        }
      });
    } catch (e) {
      console.error('Error preparing export package:', e);
    }
    return data;
  },
};
