import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Trophy,
  ArrowLeft,
  Timer,
} from 'lucide-react';
import { QUESTIONS_DATA } from '../data/questions';
import { Question } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProgressStore } from '../store/progressStore';

export const QuestionPractice: React.FC = () => {
  const navigate = useNavigate();
  const { markQuestionSolved } = useProgressStore();

  // Setup state
  const [isStarted, setIsStarted] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'All' | 'Quant' | 'VARC' | 'DILR'>('Quant');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [useTimer, setUseTimer] = useState<boolean>(true);

  // Active quiz state
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Start practice session
  const handleStart = () => {
    let pool = QUESTIONS_DATA;
    if (selectedSection !== 'All') {
      pool = pool.filter((q) => q.section === selectedSection);
    }
    // Shuffle and pick questionCount
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setPracticeQuestions(shuffled.slice(0, questionCount));
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSecondsElapsed(0);
    setIsFinished(false);
    setIsStarted(true);
  };

  // Timer interval
  useEffect(() => {
    if (!isStarted || isFinished) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isFinished]);

  const currentQ = practiceQuestions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleFinish = () => {
    // Record into progress
    practiceQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen !== undefined) {
        markQuestionSolved(q.id, chosen, chosen === q.correctIndex);
      }
    });
    setIsFinished(true);
  };

  // Score calculations
  const totalAttempted = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  let wrongCount = 0;

  practiceQuestions.forEach((q, idx) => {
    const chosen = selectedAnswers[idx];
    if (chosen !== undefined) {
      if (chosen === q.correctIndex) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }
  });

  const rawScore = correctCount * 3 - wrongCount * 1;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const avgTimePerQuestion =
    totalAttempted > 0 ? Math.round(secondsElapsed / totalAttempted) : 0;

  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-7 py-8 text-left">
      {!isStarted ? (
        /* Configuration Screen */
        <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-12 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-6">
          <div className="space-y-1">
            <Link
              to="/questions"
              className="text-xs font-semibold text-[#7456ff] hover:underline flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Question Bank
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b]">
              Configure Timed Practice Mode
            </h1>
            <p className="text-xs sm:text-sm text-[#77788b]">
              Simulate exam pressure by setting targeted practice drills with instant post-attempt metrics.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#e9e7f4]">
            {/* Section */}
            <div>
              <label className="text-xs font-bold text-[#17172b] uppercase tracking-wider block mb-2">
                Select Subject Section
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['All', 'Quant', 'VARC', 'DILR'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedSection === sec
                        ? 'border-[#7456ff] bg-[#eeebff] text-[#7456ff]'
                        : 'border-[#e9e7f4] bg-white text-[#77788b] hover:border-[#7456ff]'
                    }`}
                  >
                    {sec === 'All' ? 'Mixed Practice' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs font-bold text-[#17172b] uppercase tracking-wider block mb-2">
                Number of Questions
              </label>
              <div className="flex gap-3">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      questionCount === num
                        ? 'border-[#7456ff] bg-[#eeebff] text-[#7456ff]'
                        : 'border-[#e9e7f4] bg-white text-[#77788b] hover:border-[#7456ff]'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Toggle */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] cursor-pointer">
                <div>
                  <span className="font-bold text-xs text-[#17172b] block">Enable Practice Timer</span>
                  <span className="text-[11px] text-[#77788b]">Track seconds spent per question</span>
                </div>
                <input
                  type="checkbox"
                  checked={useTimer}
                  onChange={(e) => setUseTimer(e.target.checked)}
                  className="w-5 h-5 text-[#7456ff] rounded"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e9e7f4]">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={handleStart}
            >
              Start Practice Session ({questionCount} Questions)
            </Button>
          </div>
        </div>
      ) : isFinished ? (
        /* Result Summary Screen */
        <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-12 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#d9ff64] text-[#17172b] flex items-center justify-center mx-auto shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#17172b]">Practice Complete!</h2>
            <p className="text-xs text-[#77788b]">
              Your results and responses have been logged to your daily streak tracker.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase">Score (+3/-1)</span>
              <p className="text-2xl font-bold text-[#7456ff] mt-1">{rawScore}</p>
            </div>

            <div className="p-4 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase">Accuracy</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{accuracy}%</p>
            </div>

            <div className="p-4 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase">Correct / Total</span>
              <p className="text-2xl font-bold text-[#17172b] mt-1">
                {correctCount} / {practiceQuestions.length}
              </p>
            </div>

            <div className="p-4 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-center">
              <span className="text-[11px] font-bold text-[#77788b] uppercase">Avg Time / Q</span>
              <p className="text-2xl font-bold text-[#17172b] mt-1">{avgTimePerQuestion}s</p>
            </div>
          </div>

          {/* Review of solutions */}
          <div className="space-y-4 pt-4 border-t border-[#e9e7f4]">
            <h3 className="font-bold text-base text-[#17172b]">Detailed Solutions Review</h3>
            {practiceQuestions.map((q, idx) => {
              const userOpt = selectedAnswers[idx];
              const isCorrect = userOpt === q.correctIndex;
              return (
                <div key={q.id} className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#7456ff]">Question {idx + 1}</span>
                    {userOpt !== undefined ? (
                      isCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct (+3)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-red-600" /> Incorrect (-1)
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-gray-500 font-semibold">Skipped (0)</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#17172b]">{q.text}</p>
                  <p className="text-xs text-[#77788b] mt-1">
                    <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                  </p>
                  <p className="text-xs text-[#77788b] leading-relaxed bg-white p-3 rounded-xl border border-[#e9e7f4]">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e9e7f4]">
            <Button variant="secondary" onClick={() => setIsStarted(false)}>
              Practise Another Set
            </Button>
            <Link to="/questions">
              <Button variant="primary">Return to Bank</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Active Practice Interface */
        <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-10 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-6">
          {/* Top Bar: Progress + Timer */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e9e7f4]">
            <span className="text-xs font-bold text-[#7456ff]">
              Question {currentIndex + 1} of {practiceQuestions.length}
            </span>

            {useTimer && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17172b] bg-[#eeebff] px-3 py-1 rounded-xl">
                <Timer className="w-4 h-4 text-[#7456ff]" />
                <span>
                  {Math.floor(secondsElapsed / 60)}:
                  {String(secondsElapsed % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Question Text */}
          {currentQ && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">
                  {currentQ.section}
                </Badge>
                <Badge variant="lime" size="sm">
                  {currentQ.topic}
                </Badge>
              </div>
              <p className="text-base font-bold text-[#17172b] leading-relaxed">
                {currentQ.text}
              </p>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
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
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-[#e9e7f4] flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              Previous
            </Button>

            {currentIndex < practiceQuestions.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="!bg-emerald-600 hover:!bg-emerald-700"
                onClick={handleFinish}
              >
                Submit Practice Drill
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
