import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getMockTestQuestions, MOCK_TEST_CONFIG, calculatePercentile } from '../data/mockTests';
import { useProgressStore } from '../store/progressStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MockTestAttempt, Question } from '../types';

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked';

export const MockTest: React.FC = () => {
  const navigate = useNavigate();
  const { recordMockAttempt } = useProgressStore();

  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Status and answer tracking
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});

  // 40-minute timer
  const [timeLeft, setTimeLeft] = useState(MOCK_TEST_CONFIG.durationSeconds);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Initialize test questions
  const handleStartTest = () => {
    const qList = getMockTestQuestions();
    setQuestions(qList);
    setAnswers({});
    setMarkedForReview({});
    setVisited({ [qList[0]?.id || '']: true });
    setTimeLeft(MOCK_TEST_CONFIG.durationSeconds);
    setCurrentIndex(0);
    setTestStarted(true);
  };

  // Timer effect with auto-submit at zero
  useEffect(() => {
    if (!testStarted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const currentQ = questions[currentIndex];

  // Helper to mark status of a question
  const getQuestionStatus = (q: Question, idx: number): QuestionStatus => {
    const hasAnswer = answers[q.id] !== undefined;
    const isMarked = markedForReview[q.id] === true;
    const isVis = visited[q.id] === true || idx === currentIndex;

    if (hasAnswer && isMarked) return 'answered_marked';
    if (isMarked) return 'marked';
    if (hasAnswer) return 'answered';
    if (isVis) return 'not_answered';
    return 'not_visited';
  };

  const handleSelectOption = (optIndex: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleMarkReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleNavigateQuestion = (index: number) => {
    setCurrentIndex(index);
    const targetQ = questions[index];
    if (targetQ) {
      setVisited((prev) => ({ ...prev, [targetQ.id]: true }));
    }
  };

  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      handleNavigateQuestion(currentIndex + 1);
    }
  };

  // Submission handler
  const handleFinalSubmit = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const sectionScores: Record<string, { correct: number; wrong: number; score: number }> = {
      VARC: { correct: 0, wrong: 0, score: 0 },
      DILR: { correct: 0, wrong: 0, score: 0 },
      Quant: { correct: 0, wrong: 0, score: 0 },
    };

    questions.forEach((q) => {
      const chosen = answers[q.id];
      const sec = q.section in sectionScores ? q.section : 'Quant';

      if (chosen === undefined) {
        skipped++;
      } else if (chosen === q.correctIndex) {
        correct++;
        sectionScores[sec].correct++;
        sectionScores[sec].score += 3;
      } else {
        wrong++;
        sectionScores[sec].wrong++;
        sectionScores[sec].score -= 1;
      }
    });

    const score = correct * 3 - wrong * 1;
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const estimatedPercentile = calculatePercentile(score, MOCK_TEST_CONFIG.maxMarks);
    const timeSpentSec = MOCK_TEST_CONFIG.durationSeconds - Math.max(0, timeLeft);

    const attemptRecord: MockTestAttempt = {
      id: `mock-${Date.now()}`,
      date: new Date().toISOString(),
      score,
      totalMarks: MOCK_TEST_CONFIG.maxMarks,
      attempted,
      correct,
      wrong,
      skipped,
      accuracy,
      estimatedPercentile,
      timeSpentSec,
      sectionScores,
      userAnswers: answers,
    };

    recordMockAttempt(attemptRecord);
    setTestStarted(false);
    navigate('/mock-test/result', { state: { attempt: attemptRecord } });
  };

  // Timer formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgentTimer = timeLeft < 300; // Under 5 minutes turns red

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left">
      {!testStarted ? (
        /* Intro & Instructions Screen */
        <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-12 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-8 max-w-3xl mx-auto">
          <div>
            <Badge variant="purple" size="md" className="mb-2">
              National Practice Test Series
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b]">
              ConfirmMyCollege Mini MBA Mock Test 2026
            </h1>
            <p className="text-xs sm:text-sm text-[#77788b] mt-1">
              Accurately simulated 40-minute diagnostic test to evaluate your national MBA entrance readiness.
            </p>
          </div>

          {/* Test Specs Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase block">Questions</span>
              <span className="text-xl font-bold text-[#17172b]">20 Questions</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase block">Duration</span>
              <span className="text-xl font-bold text-[#7456ff]">40 Minutes</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase block">Scoring</span>
              <span className="text-xl font-bold text-emerald-700">+3 / -1</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase block">Max Marks</span>
              <span className="text-xl font-bold text-[#17172b]">60 Marks</span>
            </div>
          </div>

          {/* Section Breakdown & Guidance */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#17172b]">Sectional Allocation & Time Guidance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MOCK_TEST_CONFIG.sections.map((s) => (
                <div key={s.name} className="p-3.5 rounded-xl border border-[#e9e7f4] bg-white">
                  <span className="font-bold text-xs text-[#7456ff] block">{s.name}</span>
                  <p className="text-xs text-[#17172b] font-medium mt-0.5">{s.count} Questions</p>
                  <span className="text-[11px] text-[#77788b]">Suggested: ~{s.recommendedMinutes} min</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Rules */}
          <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] space-y-2 text-xs text-[#77788b] leading-relaxed">
            <h4 className="font-bold text-[#17172b] text-sm">Exam Instructions & Palette Legend:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Each correct answer awards <strong>+3 marks</strong>; an incorrect answer incurs a penalty of <strong>-1 mark</strong>.</li>
              <li>Unattempted questions carry zero marks.</li>
              <li>The test will auto-submit automatically once the 40-minute countdown reaches 00:00.</li>
              <li>You can freely toggle between questions using the right-side question palette.</li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full text-base"
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={handleStartTest}
          >
            I am Ready — Begin Mock Test
          </Button>
        </div>
      ) : (
        /* Active Test Interface */
        <div className="space-y-6">
          {/* Top Bar with Timer and Submit Button */}
          <div className="bg-white p-4 rounded-2xl border border-[#e9e7f4] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#77788b] uppercase">CAT 2026 Mini Mock</span>
              <h2 className="font-bold text-sm sm:text-base text-[#17172b]">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm ${
                  isUrgentTimer
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : 'bg-[#eeebff] text-[#7456ff]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  Time Remaining: {String(minutes).padStart(2, '0')}:
                  {String(seconds).padStart(2, '0')}
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="!bg-emerald-600 hover:!bg-emerald-700"
                onClick={() => setConfirmSubmitOpen(true)}
              >
                Submit Test
              </Button>
            </div>
          </div>

          {/* Test Body: Left Question Panel + Right Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Question Card */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-[24px] border border-[#e9e7f4] shadow-xs space-y-6">
              {currentQ && (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e9e7f4]">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">
                        {currentQ.section}
                      </Badge>
                      <Badge variant="lime" size="sm">
                        {currentQ.topic}
                      </Badge>
                    </div>
                    <span className="text-xs font-semibold text-[#77788b]">
                      Marks: +3 / -1
                    </span>
                  </div>

                  <p className="text-base font-bold text-[#17172b] leading-relaxed whitespace-pre-wrap">
                    {currentQ.text}
                  </p>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt, idx) => {
                      const isChosen = answers[currentQ.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                            isChosen
                              ? 'border-[#7456ff] bg-[#eeebff] text-[#7456ff] font-bold shadow-xs'
                              : 'border-[#e9e7f4] bg-white hover:border-[#7456ff]/60 text-[#17172b]'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-6 border-t border-[#e9e7f4] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Bookmark className="w-4 h-4 text-[#7456ff]" />}
                        onClick={handleToggleMarkReview}
                      >
                        {markedForReview[currentQ.id]
                          ? 'Unmark Review'
                          : 'Mark for Review & Next'}
                      </Button>
                      <button
                        type="button"
                        onClick={handleClearResponse}
                        className="text-xs font-bold text-[#77788b] hover:text-red-500 p-2"
                      >
                        Clear Response
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveAndNext}
                      icon={<ChevronRight className="w-4 h-4" />}
                    >
                      Save & Next
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Right: Question Palette */}
            <div className="lg:col-span-4 bg-white p-5 rounded-[24px] border border-[#e9e7f4] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#17172b]">Question Palette</h3>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#77788b] pb-3 border-b border-[#e9e7f4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 shrink-0" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-gray-200 shrink-0" />
                  <span>Not Visited</span>
                </div>
              </div>

              {/* Question Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q, idx);
                  const isCurrent = idx === currentIndex;

                  let bgClass = 'bg-gray-100 text-[#77788b]';
                  if (status === 'answered') bgClass = 'bg-emerald-600 text-white';
                  else if (status === 'answered_marked')
                    bgClass = 'bg-purple-600 text-white ring-2 ring-emerald-400';
                  else if (status === 'marked') bgClass = 'bg-purple-600 text-white';
                  else if (status === 'not_answered') bgClass = 'bg-red-500 text-white';

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigateQuestion(idx)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${bgClass} ${
                        isCurrent ? 'ring-3 ring-[#7456ff] ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#e9e7f4]">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full !bg-emerald-600 hover:!bg-emerald-700"
                  onClick={() => setConfirmSubmitOpen(true)}
                >
                  Submit Assessment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Submit */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs"
            onClick={() => setConfirmSubmitOpen(false)}
          />
          <div className="relative bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl z-10 space-y-4 text-left">
            <h3 className="font-bold text-lg text-[#17172b]">Confirm Mock Test Submission?</h3>
            <p className="text-xs text-[#77788b] leading-relaxed">
              You have answered{' '}
              <strong className="text-emerald-700">{Object.keys(answers).length}</strong> out of{' '}
              <strong>{questions.length}</strong> questions. Once submitted, your scores and percentile will
              be finalized.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmSubmitOpen(false)}>
                Continue Test
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-emerald-600 hover:!bg-emerald-700"
                onClick={handleFinalSubmit}
              >
                Yes, Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
