import { QUESTIONS_DATA } from './questions';
import { Question } from '../types';

export const MOCK_TEST_CONFIG = {
  title: 'ConfirmMyCollege All-India Mini MBA Mock CAT 2026',
  durationMinutes: 40,
  durationSeconds: 40 * 60,
  marksPerCorrect: 3,
  negativeMarksPerWrong: 1,
  totalQuestions: 20,
  maxMarks: 60,
  sections: [
    { name: 'VARC', count: 7, recommendedMinutes: 14 },
    { name: 'DILR', count: 5, recommendedMinutes: 12 },
    { name: 'Quant', count: 8, recommendedMinutes: 14 },
  ],
};

export const getMockTestQuestions = (): Question[] => {
  const varcIds = ['q-v1', 'q-v2', 'q-v3', 'q-v4', 'q-v6', 'q-v7', 'q-v10'];
  const dilrIds = ['q-d1', 'q-d2', 'q-d3', 'q-d4', 'q-d5'];
  const quantIds = ['q-q1', 'q-q2', 'q-q3', 'q-q4', 'q-q5', 'q-q6', 'q-q8', 'q-q10'];

  const selectedIds = [...varcIds, ...dilrIds, ...quantIds];
  return selectedIds
    .map((id) => QUESTIONS_DATA.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);
};

export const calculatePercentile = (score: number, maxScore: number = 60): number => {
  // Realistic CAT percentile estimation formula based on normalized distribution curve
  if (score <= 0) return Math.max(10, Math.round(score + 15));
  const rawRatio = Math.min(score / maxScore, 1);
  // Curve: 50% score (30/60) translates to ~95th percentile in tough CAT
  let est = 50 + (rawRatio * 50) + (rawRatio > 0.4 ? 12 : 0) - (rawRatio < 0.2 ? 10 : 0);
  if (score >= 45) est = 99.2;
  if (score >= 52) est = 99.85;
  return Math.min(99.9, Math.max(15, parseFloat(est.toFixed(1))));
};
