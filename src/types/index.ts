export type ProgrammeType = 'MBA' | 'PGDM' | 'Executive MBA' | 'Online MBA';
export type ExamName = 'CAT' | 'XAT' | 'SNAP' | 'NMAT' | 'CMAT' | 'GMAT' | 'MAT';

export interface ExtraQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required: boolean;
  maxWords?: number;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  programmes: {
    type: ProgrammeType;
    name: string;
    durationYears: number;
    totalFeeInr: number;
    seats: number;
  }[];
  examsAccepted: ExamName[];
  minPercentile: number;
  avgPackageLpa: number;
  highestPackageLpa: number;
  hostel: boolean;
  applicationDeadline: string; /* ISO date */
  eligibility: string[];
  admissionProcess: string[];
  importantDates: { label: string; date: string }[];
  faqs: { q: string; a: string }[];
  extraQuestions: ExtraQuestion[];
  tags: string[];
  isDemo: true;
}

export interface Academic {
  board: string;
  institution: string;
  yearOfPassing: number;
  percentage: number;
}

export interface StudentProfile {
  personal: {
    fullName: string;
    dob: string;
    gender: string;
    category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'PwD';
    nationality: string;
    phone: string;
    email: string;
    address: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
    };
    photoDataUrl?: string;
    signatureDataUrl?: string;
    phoneVerified?: boolean;
  };
  academics: {
    tenth: Academic;
    twelfth: Academic;
    graduation: Academic & {
      degree: string;
      stream: string;
      backlogs: number;
    };
  };
  exams: {
    name: ExamName;
    year: number;
    score: number;
    percentile: number;
    rollNo: string;
    notTaken?: boolean;
  }[];
  work: {
    employer: string;
    role: string;
    fromMonth: string;
    toMonth: string;
    description: string;
  }[];
  isFresher?: boolean;
  sop: string;
  achievements: string;
  certifications: string;
  extracurriculars?: string;
}

export interface ApplicationChoice {
  collegeId: string;
  programme: ProgrammeType;
  preference: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected';
}

export interface Application {
  id: string;
  status: 'Draft' | 'Submitted';
  step: number;
  choices: ApplicationChoice[];
  extraAnswers: Record<string, Record<string, string | boolean>>; /* collegeId -> questionId -> answer */
  documents: {
    type: string;
    fileName: string;
    sizeKb: number;
    uploadedAt: string;
  }[];
  payment?: {
    amountInr: number;
    paidAt: string;
    receiptNo: string;
    mock: true;
  };
  consentAccepted?: boolean;
  declarationAccepted?: boolean;
}

export interface Question {
  id: string;
  exam: ExamName;
  section: 'Quant' | 'VARC' | 'DILR' | 'GK' | 'Interview';
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  frequencyTag: 'Very frequent' | 'Frequent' | 'Occasional';
  tags: string[];
  isAiGenerated?: boolean;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amountInr: number;
  eligibility: string;
  deadline: string;
  minPercentile: number;
  maxFamilyIncomeLpa: number;
  categoryTags: string[];
  steps: string[];
}

export interface MockTestAttempt {
  id: string;
  date: string;
  score: number;
  totalMarks: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  estimatedPercentile: number;
  timeSpentSec: number;
  sectionScores: Record<string, { correct: number; wrong: number; score: number }>;
  userAnswers: Record<string, number>;
}

export interface QuizAnswers {
  percentile: number;
  preferredCities: string[];
  annualBudgetLakh: number;
  workExperienceYears: number;
  careerGoal: string;
  importanceRanking: string[];
}

export interface QuizRecommendation {
  collegeId: string;
  matchPercent: number;
  reason: string;
}
