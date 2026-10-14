import { create } from 'zustand';
import { StorageService } from '../services/storage';
import {
  Application,
  ApplicationChoice,
  StudentProfile,
  ProgrammeType,
} from '../types';

export const APPLICATION_FEE_INR = 1500;

const defaultProfile: StudentProfile = {
  personal: {
    fullName: '',
    dob: '',
    gender: 'Male',
    category: 'General',
    nationality: 'Indian',
    phone: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      pincode: '',
    },
    phoneVerified: false,
  },
  academics: {
    tenth: { board: '', institution: '', yearOfPassing: 2019, percentage: 85 },
    twelfth: { board: '', institution: '', yearOfPassing: 2021, percentage: 82 },
    graduation: {
      board: '',
      institution: '',
      yearOfPassing: 2024,
      percentage: 75,
      degree: 'B.Tech',
      stream: 'Computer Science',
      backlogs: 0,
    },
  },
  exams: [
    {
      name: 'CAT',
      year: 2025,
      score: 84,
      percentile: 91.5,
      rollNo: 'CAT25-98214',
      notTaken: false,
    },
  ],
  work: [],
  isFresher: true,
  sop: '',
  achievements: '',
  certifications: '',
  extracurriculars: '',
};

const defaultApplication: Application = {
  id: 'APP-' + Math.floor(100000 + Math.random() * 900000),
  status: 'Draft',
  step: 1,
  choices: [],
  extraAnswers: {},
  documents: [],
  consentAccepted: false,
  declarationAccepted: false,
};

interface ApplicationStore {
  profile: StudentProfile;
  application: Application;
  lastSavedAt: string;

  setStep: (step: number) => void;
  updateProfile: (updater: (prev: StudentProfile) => StudentProfile) => void;
  updateApplication: (updater: (prev: Application) => Application) => void;

  addChoice: (collegeId: string, programme: ProgrammeType) => { success: boolean; message?: string };
  removeChoice: (collegeId: string) => void;
  updateChoiceProgramme: (collegeId: string, programme: ProgrammeType) => void;
  reorderChoices: (fromIndex: number, toIndex: number) => void;

  setExtraAnswer: (collegeId: string, questionId: string, answer: string | boolean) => void;
  addDocument: (doc: { type: string; fileName: string; sizeKb: number; uploadedAt: string }) => void;
  removeDocument: (type: string) => void;

  setConsentAccepted: (val: boolean) => void;
  setDeclarationAccepted: (val: boolean) => void;

  processMockPayment: () => { receiptNo: string };
  resetApplication: () => void;
}

const loadedProfile = StorageService.getProfile<StudentProfile>(defaultProfile);
const loadedApp = StorageService.getApplication<Application>(defaultApplication);

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  profile: loadedProfile,
  application: loadedApp,
  lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),

  setStep: (step) => {
    const updatedApp = { ...get().application, step };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  updateProfile: (updater) => {
    const updated = updater(get().profile);
    StorageService.setProfile(updated);
    set({
      profile: updated,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  },

  updateApplication: (updater) => {
    const updated = updater(get().application);
    StorageService.setApplication(updated);
    set({
      application: updated,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  },

  addChoice: (collegeId, programme) => {
    const current = get().application.choices;
    if (current.some((c) => c.collegeId === collegeId)) {
      return { success: true };
    }
    if (current.length >= 5) {
      return {
        success: false,
        message: 'You can select up to 5 B-schools in the common application.',
      };
    }
    const newChoice: ApplicationChoice = {
      collegeId,
      programme,
      preference: current.length + 1,
      status: 'Draft',
    };
    const updatedChoices = [...current, newChoice];
    const updatedApp = { ...get().application, choices: updatedChoices };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
    return { success: true };
  },

  removeChoice: (collegeId) => {
    const updatedChoices = get()
      .application.choices.filter((c) => c.collegeId !== collegeId)
      .map((c, idx) => ({ ...c, preference: idx + 1 }));
    const updatedApp = { ...get().application, choices: updatedChoices };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  updateChoiceProgramme: (collegeId, programme) => {
    const updatedChoices = get().application.choices.map((c) =>
      c.collegeId === collegeId ? { ...c, programme } : c
    );
    const updatedApp = { ...get().application, choices: updatedChoices };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  reorderChoices: (fromIndex, toIndex) => {
    const choices = [...get().application.choices];
    const [moved] = choices.splice(fromIndex, 1);
    choices.splice(toIndex, 0, moved);
    const reindexed = choices.map((c, idx) => ({ ...c, preference: idx + 1 }));
    const updatedApp = { ...get().application, choices: reindexed };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  setExtraAnswer: (collegeId, questionId, answer) => {
    const currentExtras = { ...get().application.extraAnswers };
    if (!currentExtras[collegeId]) {
      currentExtras[collegeId] = {};
    }
    currentExtras[collegeId][questionId] = answer;
    const updatedApp = { ...get().application, extraAnswers: currentExtras };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  addDocument: (doc) => {
    const filtered = get().application.documents.filter((d) => d.type !== doc.type);
    const updatedDocs = [...filtered, doc];
    const updatedApp = { ...get().application, documents: updatedDocs };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  removeDocument: (type) => {
    const updatedDocs = get().application.documents.filter((d) => d.type !== type);
    const updatedApp = { ...get().application, documents: updatedDocs };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  setConsentAccepted: (val) => {
    const updatedApp = { ...get().application, consentAccepted: val };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  setDeclarationAccepted: (val) => {
    const updatedApp = { ...get().application, declarationAccepted: val };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
  },

  processMockPayment: () => {
    const receiptNo = `CMC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const updatedChoices = get().application.choices.map((c) => ({
      ...c,
      status: 'Submitted' as const,
    }));
    const updatedApp: Application = {
      ...get().application,
      status: 'Submitted',
      choices: updatedChoices,
      payment: {
        amountInr: APPLICATION_FEE_INR,
        paidAt: now,
        receiptNo,
        mock: true,
      },
    };
    StorageService.setApplication(updatedApp);
    set({ application: updatedApp });
    return { receiptNo };
  },

  resetApplication: () => {
    StorageService.setProfile(defaultProfile);
    StorageService.setApplication(defaultApplication);
    set({
      profile: defaultProfile,
      application: defaultApplication,
    });
  },
}));
