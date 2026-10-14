import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Heart,
  RotateCcw,
  Building2,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { COLLEGES_DATA } from '../data/colleges';
import { GeminiService } from '../services/gemini';
import { useShortlistStore } from '../store/shortlistStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { QuizAnswers, QuizRecommendation } from '../types';

const CAREER_GOALS = [
  'Consulting & Strategy',
  'Finance & FinTech',
  'Marketing & Brand Management',
  'Business Analytics & AI',
  'Supply Chain & Operations',
  'General Management & Leadership',
];

const ALL_CITIES = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Manipal'];

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { shortlist, toggleShortlist } = useShortlistStore();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    percentile: 85,
    preferredCities: ['Mumbai', 'Bengaluru'],
    annualBudgetLakh: 18,
    workExperienceYears: 1,
    careerGoal: 'Finance & FinTech',
    importanceRanking: ['Placements', 'Brand Reputation', 'Location', 'Fees'],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<QuizRecommendation[] | null>(null);

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    try {
      const recs = await GeminiService.getQuizRecommendations(answers, COLLEGES_DATA);
      setRecommendations(recs);
      showToast('Personalized recommendations generated!', 'success');
    } catch {
      showToast('The AI is busy, please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllToShortlist = () => {
    if (!recommendations) return;
    recommendations.forEach((r) => {
      if (!shortlist.includes(r.collegeId)) {
        toggleShortlist(r.collegeId);
      }
    });
    showToast('Added all 5 recommended colleges to your shortlist!', 'success');
  };

  const handleRetake = () => {
    setRecommendations(null);
    setStep(1);
  };

  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-7 py-8 text-left">
      {!recommendations ? (
        /* 6-Question Stepper */
        <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-12 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e9e7f4]">
            <div>
              <span className="text-xs font-bold text-[#7456ff] uppercase tracking-wider block">
                Question {step} of 6
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#17172b] mt-0.5">
                AI College Recommender Quiz
              </h1>
            </div>
            <div className="flex items-center gap-1.5 bg-[#d9ff64] text-[#17172b] px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Flash</span>
            </div>
          </div>

          {/* QUESTION 1: PERCENTILE */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-[#17172b]">
                1. What is your expected or current MBA entrance percentile (CAT/XAT/NMAT)?
              </h2>
              <div className="p-6 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-center space-y-3">
                <span className="text-4xl font-extrabold text-[#7456ff]">
                  {answers.percentile}%ile
                </span>
                <input
                  type="range"
                  min="60"
                  max="99"
                  step="1"
                  value={answers.percentile}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      percentile: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-[#7456ff] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#77788b]">
                  <span>60%ile</span>
                  <span>80%ile</span>
                  <span>99%ile</span>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 2: CITIES */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-[#17172b]">
                2. Which preferred cities or tech corridors would you like to study in?
              </h2>
              <p className="text-xs text-[#77788b]">Select all locations that appeal to you.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALL_CITIES.map((city) => {
                  const isSelected = answers.preferredCities.includes(city);
                  return (
                    <button
                      key={city}
                      onClick={() => {
                        const updated = isSelected
                          ? answers.preferredCities.filter((c) => c !== city)
                          : [...answers.preferredCities, city];
                        setAnswers((prev) => ({ ...prev, preferredCities: updated }));
                      }}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7456ff] bg-[#eeebff] text-[#7456ff] shadow-xs'
                          : 'border-[#e9e7f4] bg-white text-[#77788b] hover:border-[#7456ff]'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION 3: ANNUAL BUDGET */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-[#17172b]">
                3. What is your total comfortable budget for the 2-year MBA programme?
              </h2>
              <div className="p-6 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-center space-y-3">
                <span className="text-4xl font-extrabold text-[#7456ff]">
                  ₹{answers.annualBudgetLakh} Lakh
                </span>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={answers.annualBudgetLakh}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      annualBudgetLakh: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-[#7456ff] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#77788b]">
                  <span>₹5 Lakh (High ROI)</span>
                  <span>₹15 Lakh</span>
                  <span>₹25 Lakh (Flagship)</span>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 4: WORK EXPERIENCE */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-[#17172b]">
                4. How many years of full-time professional work experience do you possess?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Fresher (0 Years)', value: 0 },
                  { label: '1 - 2 Years', value: 1.5 },
                  { label: '2 - 3 Years', value: 2.5 },
                  { label: '3 - 5 Years', value: 4 },
                  { label: '5+ Years (Executive)', value: 5 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        workExperienceYears: item.value,
                      }))
                    }
                    className={`p-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      answers.workExperienceYears === item.value
                        ? 'border-[#7456ff] bg-[#eeebff] text-[#7456ff] shadow-xs'
                        : 'border-[#e9e7f4] bg-white text-[#77788b] hover:border-[#7456ff]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 5: CAREER GOAL */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-[#17172b]">
                5. What is your primary career trajectory post-graduation?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAREER_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        careerGoal: goal,
                      }))
                    }
                    className={`p-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      answers.careerGoal === goal
                        ? 'border-[#7456ff] bg-[#eeebff] text-[#7456ff] shadow-xs'
                        : 'border-[#e9e7f4] bg-white text-[#17172b] hover:border-[#7456ff]'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 6: IMPORTANCE RANKING */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-[#17172b]">
                6. What matters most to you in your B-school decision?
              </h2>
              <div className="space-y-2">
                {answers.importanceRanking.map((factor, idx) => (
                  <div
                    key={factor}
                    className="p-3.5 bg-[#f8f7ff] rounded-xl border border-[#e9e7f4] flex items-center justify-between text-xs font-bold text-[#17172b]"
                  >
                    <span>
                      Priority #{idx + 1}: {factor}
                    </span>
                    <span className="text-[#7456ff] text-[11px]">Ranked</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-[#e9e7f4] flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(step - 1)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {step === 6 ? 'Get AI Recommendations' : 'Next Question'}
            </Button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-12 shadow-[0_12px_32px_rgba(33,25,76,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e9e7f4]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7456ff] bg-[#eeebff] px-3 py-1 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommender Powered by Gemini</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b]">
                Your Top 5 Matching B-Schools
              </h1>
              <p className="text-xs text-[#77788b] mt-0.5">
                Curated specifically for your {answers.percentile}%ile profile and {answers.careerGoal} target.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRetake}
            >
              Retake Quiz
            </Button>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const col = COLLEGES_DATA.find((c) => c.id === rec.collegeId);
              if (!col) return null;

              return (
                <div
                  key={rec.collegeId}
                  className="p-5 rounded-2xl border border-[#e9e7f4] bg-white hover:border-[#7456ff]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="lime" size="sm">
                        {rec.matchPercent}% Match
                      </Badge>
                      <Badge variant="purple" size="sm">
                        {col.city}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base text-[#17172b] leading-tight">
                      <Link to={`/college/${col.id}`} className="hover:text-[#7456ff]">
                        {col.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-[#7456ff] font-semibold italic">
                      "{rec.reason}"
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#77788b] pt-1">
                      <span>Total Fee: ₹{((col.programmes[0]?.totalFeeInr || 0) / 100000).toFixed(1)}L</span>
                      <span>•</span>
                      <span>Avg CTC: ₹{col.avgPackageLpa} LPA</span>
                      <span>•</span>
                      <span>Cutoff: {col.minPercentile}%ile</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/college/${col.id}`}>
                      <Button variant="secondary" size="sm">
                        View College
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#e9e7f4] flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="primary"
              size="md"
              icon={<Heart className="w-4 h-4 fill-white" />}
              onClick={handleAddAllToShortlist}
            >
              Add All to Shortlist
            </Button>

            <Link to="/apply">
              <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Common Application Form
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
