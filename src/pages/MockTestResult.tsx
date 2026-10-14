import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MockTestAttempt, Question } from '../types';
import { getMockTestQuestions } from '../data/mockTests';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProgressStore } from '../store/progressStore';

export const MockTestResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mockAttempts } = useProgressStore();

  const attempt: MockTestAttempt | undefined =
    location.state?.attempt || mockAttempts[0];

  const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');

  if (!attempt) {
    return (
      <div className="max-w-[1180px] mx-auto px-5 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#17172b]">No Mock Attempt Found</h2>
        <p className="text-xs text-[#77788b] mt-1 mb-6">
          Take our 40-minute diagnostic mock test to evaluate your national entrance preparation.
        </p>
        <Link to="/mock-test">
          <Button variant="primary">Start Free Mock Test</Button>
        </Link>
      </div>
    );
  }

  const mockQuestions = getMockTestQuestions();

  const filteredQuestions = mockQuestions.filter((q) => {
    const userAns = attempt.userAnswers[q.id];
    if (solutionFilter === 'all') return true;
    if (solutionFilter === 'skipped') return userAns === undefined;
    if (solutionFilter === 'correct') return userAns === q.correctIndex;
    if (solutionFilter === 'wrong') return userAns !== undefined && userAns !== q.correctIndex;
    return true;
  });

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-7 py-8 text-left space-y-8">
      {/* Top Banner / Scorecard */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-10 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#7456ff] uppercase tracking-wider block">
              Diagnostic Scorecard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b]">
              Mock Test Performance Report
            </h1>
            <p className="text-xs text-[#77788b] mt-0.5">
              Attempted on {new Date(attempt.date).toLocaleString()}
            </p>
          </div>

          <Link to="/mock-test">
            <Button variant="secondary" size="sm" icon={<RotateCcw className="w-4 h-4" />}>
              Retake Test
            </Button>
          </Link>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#e9e7f4]">
          {/* Estimated Percentile */}
          <div className="p-5 rounded-2xl bg-[#eeebff] border border-[#7456ff]/30 text-center">
            <span className="text-[11px] font-bold text-[#7456ff] uppercase block">
              Estimated Percentile
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#7456ff] mt-1">
              {attempt.estimatedPercentile}%ile
            </p>
            <span className="text-[10px] text-[#77788b] block mt-1">Estimated, for practice only</span>
          </div>

          {/* Net Score */}
          <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
            <span className="text-[11px] font-bold text-[#77788b] uppercase block">
              Net Score (+3 / -1)
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#17172b] mt-1">
              {attempt.score} <span className="text-sm font-semibold text-gray-500">/ 60</span>
            </p>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">
              {attempt.correct} Correct, {attempt.wrong} Wrong
            </span>
          </div>

          {/* Accuracy */}
          <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
            <span className="text-[11px] font-bold text-[#77788b] uppercase block">Accuracy</span>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 mt-1">
              {attempt.accuracy}%
            </p>
            <span className="text-[10px] text-[#77788b] block mt-1">
              {attempt.attempted} of 20 attempted
            </span>
          </div>

          {/* Time Analysis */}
          <div className="p-5 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] text-center">
            <span className="text-[11px] font-bold text-[#77788b] uppercase block">Time Spent</span>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#17172b] mt-1">
              {Math.floor(attempt.timeSpentSec / 60)}m {attempt.timeSpentSec % 60}s
            </p>
            <span className="text-[10px] text-[#77788b] block mt-1">
              Avg {attempt.attempted > 0 ? Math.round(attempt.timeSpentSec / attempt.attempted) : 0}s per attempt
            </span>
          </div>
        </div>

        {/* Section-Wise Breakdown Bar Chart */}
        <div className="pt-4 border-t border-[#e9e7f4] space-y-3">
          <h3 className="font-bold text-sm text-[#17172b]">Section-Wise Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(attempt.sectionScores).map(([sec, stats]) => (
              <div key={sec} className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#17172b]">{sec}</span>
                  <span className="text-[#7456ff]">{stats.score} Marks</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-[#e9e7f4] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7456ff] h-full rounded-full"
                    style={{ width: `${Math.max(5, Math.min(100, (stats.score / 24) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#77788b]">
                  <span>{stats.correct} Correct</span>
                  <span>{stats.wrong} Wrong</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions Review Section with Filters */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 shadow-[0_8px_24px_rgba(33,25,76,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e9e7f4]">
          <h2 className="text-xl font-bold text-[#17172b]">Comprehensive Solutions Review</h2>

          {/* Filter Pills */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All (20)' },
              { id: 'correct', label: `Correct (${attempt.correct})` },
              { id: 'wrong', label: `Incorrect (${attempt.wrong})` },
              { id: 'skipped', label: `Skipped (${attempt.skipped})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSolutionFilter(tab.id as any)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  solutionFilter === tab.id
                    ? 'bg-[#7456ff] text-white'
                    : 'bg-[#eeebff] text-[#7456ff] hover:bg-[#e0dbff]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userChoice = attempt.userAnswers[q.id];
            const isCorrect = userChoice === q.correctIndex;
            const isSkipped = userChoice === undefined;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isSkipped
                    ? 'border-[#e9e7f4] bg-white'
                    : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#17172b]">Q{idx + 1}.</span>
                    <Badge variant="purple" size="sm">
                      {q.section}
                    </Badge>
                    <span className="text-xs text-[#77788b]">{q.topic}</span>
                  </div>

                  <div>
                    {isCorrect && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> +3 Correct
                      </span>
                    )}
                    {!isCorrect && !isSkipped && (
                      <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> -1 Incorrect
                      </span>
                    )}
                    {isSkipped && (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                        0 Skipped
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#17172b] leading-relaxed">{q.text}</p>

                {/* Options Review */}
                <div className="space-y-1.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isRightOption = optIdx === q.correctIndex;
                    const isUserChoice = optIdx === userChoice;

                    let rowClass = 'border-[#e9e7f4] bg-white text-[#77788b]';
                    if (isRightOption) {
                      rowClass = 'border-emerald-500 bg-emerald-50 font-bold text-emerald-900';
                    } else if (isUserChoice && !isRightOption) {
                      rowClass = 'border-red-400 bg-red-50 text-red-900 font-bold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${rowClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isRightOption && <span className="text-[11px] font-bold text-emerald-700">Correct Answer</span>}
                        {isUserChoice && !isRightOption && <span className="text-[11px] font-bold text-red-600">Your Selection</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-[#f8f7ff] border border-[#e9e7f4] text-xs text-[#77788b] leading-relaxed">
                  <strong className="text-[#7456ff] block mb-1">Step-by-Step Solution:</strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
