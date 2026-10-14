import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  Flame,
  Zap,
  CheckCircle2,
  Share2,
  RotateCcw,
  ArrowRight,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { COLLEGES_DATA } from '../../data/colleges';
import { College } from '../../types';
import { useShortlistStore } from '../../store/shortlistStore';
import { useApplicationStore } from '../../store/applicationStore';
import { useToast } from '../ui/Toast';
import { SoundFX } from '../../utils/sound';

interface VibeCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VibeQuestion {
  id: string;
  question: string;
  tagline: string;
  options: {
    id: string;
    label: string;
    sub: string;
    archetypeBias: string;
    emoji: string;
  }[];
}

const VIBE_QUESTIONS: VibeQuestion[] = [
  {
    id: 'career_vibe',
    question: "What's your ultimate corporate vibe?",
    tagline: 'Pick your dream day-in-the-life post MBA',
    options: [
      {
        id: 'finance',
        label: 'Wall Street & High Finance',
        sub: 'Private equity, M&A models, 70-hour grinds for insane bonuses',
        archetypeBias: 'titan',
        emoji: '🐺',
      },
      {
        id: 'startup',
        label: '0-to-1 Unicorn Builder',
        sub: 'Chief of Staff, product sprint, high risk, equity upside',
        archetypeBias: 'founder',
        emoji: '🚀',
      },
      {
        id: 'strategy',
        label: 'Consulting & Corporate Strategy',
        sub: 'Slide decks, airport lounges, fixing Fortune 500 problems',
        archetypeBias: 'consultant',
        emoji: '👔',
      },
      {
        id: 'tech',
        label: 'Silicon Valley Product / FinTech Lead',
        sub: 'AI-first product management, agile roadmaps, great work-life',
        archetypeBias: 'techlead',
        emoji: '⚡',
      },
    ],
  },
  {
    id: 'campus_energy',
    question: 'What campus energy unlocks your peak aura?',
    tagline: 'Where will you actually thrive for 2 years?',
    options: [
      {
        id: 'metro',
        label: 'High-Energy Metro Hub',
        sub: 'Mumbai / Bangalore nightlife, coffee chats with CXOs anytime',
        archetypeBias: 'titan',
        emoji: '🌆',
      },
      {
        id: 'green',
        label: 'Lush Sanctuary & Deep Focus',
        sub: 'Scenic hostels, tight-knit peer group, no city traffic stress',
        archetypeBias: 'consultant',
        emoji: '🌳',
      },
      {
        id: 'tech_campus',
        label: 'Cyber & Innovation Labs',
        sub: 'Maker spaces, hackathons, incubators with seed capital on tap',
        archetypeBias: 'founder',
        emoji: '🧪',
      },
    ],
  },
  {
    id: 'roi_priority',
    question: "What's your ROI philosophy?",
    tagline: 'Be honest: how are you funding and recovering this degree?',
    options: [
      {
        id: 'full_send',
        label: 'Full Send (Max CTC or Bust)',
        sub: 'Take the education loan, aim for the ₹25+ LPA day-1 placement',
        archetypeBias: 'titan',
        emoji: '💸',
      },
      {
        id: 'smart_roi',
        label: 'Smart ROI (Low Fee, High Payback)',
        sub: 'Sub-₹14 Lakh fee with ₹15+ LPA avg package; pay back in 12 months',
        archetypeBias: 'techlead',
        emoji: '🎯',
      },
      {
        id: 'scholarship',
        label: 'Merit Fellowship Hunter',
        sub: 'Looking for 50%+ tuition waivers and women/diversity grants',
        archetypeBias: 'consultant',
        emoji: '🏆',
      },
    ],
  },
];

interface ArchetypeResult {
  title: string;
  auraScore: string;
  subtitle: string;
  badge: string;
  description: string;
  topCollegeIds: string[];
}

const ARCHETYPES: Record<string, ArchetypeResult> = {
  titan: {
    title: 'The Tier-1 Titan',
    auraScore: '+10,000 Aura Points 📈',
    subtitle: 'High Finance, Big Stakes, Zero Excuses',
    badge: 'Wall Street Energy 🐺',
    description:
      'You are wired for high-octane deals, investment committee pitches, and rapid compounding. You value prestige, peer horsepower, and top-tier marquee recruiters who fly in for Day 0.',
    topCollegeIds: ['col-1', 'col-6', 'col-2'], // Apex Mumbai, Heritage Delhi, Imperial Gurgaon
  },
  founder: {
    title: 'The Unicorn Disruptor',
    auraScore: '+9,850 Aura Points 🚀',
    subtitle: '0-to-1 Hustle, Product Velocity & Seed Grants',
    badge: 'Founder Spirit 🦄',
    description:
      'Corporate red tape bores you. You want a B-school that has active incubator grants, founder-alumni who actually reply on WhatsApp, and courses taught by operators.',
    topCollegeIds: ['col-4', 'col-5', 'col-11'], // Venture Bengaluru, Silicon Valley Bangalore, Manipal
  },
  consultant: {
    title: 'The Mastermind Strategist',
    auraScore: '+9,600 Aura Points 👔',
    subtitle: 'Structured Thinking, Global Perspective, Quiet Luxury',
    badge: 'MBB Material 💎',
    description:
      'You see patterns where others see chaos. You want a rigorous case-study pedagogy, tight-knit residential campus life, and deep leadership grooming for C-suite roles.',
    topCollegeIds: ['col-7', 'col-2', 'col-8'], // Horizon Hyderabad, Imperial Gurgaon, Beacon Kolkata
  },
  techlead: {
    title: 'The FinTech / AI Pioneer',
    auraScore: '+9,950 Aura Points ⚡',
    subtitle: 'Tech MBA, Agile Strategy & Maximum Payback',
    badge: 'Future-Proof 🤖',
    description:
      'You understand data, AI, and code as much as EBITDA and unit economics. You want a program that bridges technology architecture with product leadership and stellar ROI.',
    topCollegeIds: ['col-3', 'col-5', 'col-10'], // FinTech Pune, Silicon Valley Bangalore, Zenith Chennai
  },
};

export const VibeCheckModal: React.FC<VibeCheckModalProps> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ArchetypeResult | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { toggleShortlist, isShortlisted } = useShortlistStore();
  const { addChoice, setStep } = useApplicationStore();

  if (!isOpen) return null;

  const currentQ = VIBE_QUESTIONS[stepIndex];

  const handleSelectOption = (questionId: string, optionBias: string) => {
    SoundFX.pop();
    const updated = { ...answers, [questionId]: optionBias };
    setAnswers(updated);

    if (stepIndex < VIBE_QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Calculate archetype
      const tally: Record<string, number> = { titan: 0, founder: 0, consultant: 0, techlead: 0 };
      Object.values(updated).forEach((bias) => {
        if (tally[bias] !== undefined) tally[bias]++;
      });

      let highest = 'titan';
      let maxCount = -1;
      Object.entries(tally).forEach(([k, count]) => {
        if (count > maxCount) {
          maxCount = count;
          highest = k;
        }
      });

      const res = ARCHETYPES[highest] || ARCHETYPES.titan;
      setResult(res);
      SoundFX.success();

      // Trigger Confetti
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7456ff', '#d9ff64', '#ff8dc7', '#17172b'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleReset = () => {
    SoundFX.tick();
    setStepIndex(0);
    setAnswers({});
    setResult(null);
  };

  const handleShare = () => {
    SoundFX.pop();
    if (!result) return;
    const text = `I just took the ConfirmMyCollege B-School Vibe Check! My MBA Archetype is "${result.title}" (${result.auraScore}). Vibe-check your B-school options: ${window.location.origin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Copied your B-School Aura Card to clipboard! 📋✨', 'success');
    }
  };

  const handleApplyToColleges = () => {
    SoundFX.pop();
    if (!result) return;
    result.topCollegeIds.slice(0, 3).forEach((cid) => {
      const col = COLLEGES_DATA.find((c) => c.id === cid);
      if (col) {
        addChoice(col.id, col.programmes[0]?.type || 'PGDM');
      }
    });
    setStep(7);
    onClose();
    navigate('/apply');
    showToast('Loaded your vibe-matched B-schools into the Common Form!', 'success');
  };

  const matchedColleges: College[] = result
    ? result.topCollegeIds
        .map((cid) => COLLEGES_DATA.find((c) => c.id === cid))
        .filter((c): c is College => Boolean(c))
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#17172b]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-xl rounded-[32px] border-2 border-[#17172b] pop-shadow overflow-hidden text-left animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#eeebff] border-b-2 border-[#17172b] p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d9ff64] border-2 border-[#17172b] pop-shadow-sm flex items-center justify-center -rotate-3 text-lg font-black">
              ✨
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#17172b] tracking-tight">
                B-School Vibe Check
              </h2>
              <p className="text-xs font-bold text-[#7456ff]">
                Find your MBA Aura & instant matching colleges
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundFX.tick();
              onClose();
            }}
            aria-label="Close vibe check modal"
            className="p-2 rounded-xl text-gray-500 hover:text-[#17172b] hover:bg-white/80 transition-colors border border-transparent hover:border-[#17172b]/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7">
          {!result ? (
            /* Questions Flow */
            <div>
              {/* Progress dots */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#77788b]">
                  Question {stepIndex + 1} of {VIBE_QUESTIONS.length}
                </span>
                <div className="flex items-center gap-2">
                  {VIBE_QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === stepIndex
                          ? 'w-8 bg-[#7456ff]'
                          : i < stepIndex
                          ? 'w-2.5 bg-[#d9ff64] border border-[#17172b]'
                          : 'w-2.5 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question heading */}
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#17172b] tracking-tight">
                  {currentQ.question}
                </h3>
                <p className="text-xs sm:text-sm text-[#77788b] mt-1 font-medium">
                  {currentQ.tagline}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.archetypeBias)}
                    className="w-full text-left p-4 rounded-2xl border-2 border-[#17172b]/15 hover:border-[#17172b] bg-[#f8f7ff] hover:bg-white hover:pop-shadow transition-all group flex items-start gap-3.5 cursor-pointer"
                  >
                    <span className="text-2xl shrink-0 group-hover:scale-125 transition-transform">
                      {opt.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm sm:text-base text-[#17172b] group-hover:text-[#7456ff] transition-colors">
                        {opt.label}
                      </div>
                      <div className="text-xs text-[#77788b] font-medium mt-0.5 leading-snug">
                        {opt.sub}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6">
              {/* Archetype Hero Card */}
              <div className="bg-gradient-to-br from-[#d9ff64]/40 via-white to-[#ff8dc7]/20 p-5 sm:p-6 rounded-[28px] border-2 border-[#17172b] pop-shadow-sm text-center relative overflow-hidden">
                <div className="inline-block bg-[#17172b] text-[#d9ff64] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  {result.badge}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#17172b] tracking-tight">
                  {result.title}
                </h3>
                <div className="text-sm font-extrabold text-[#7456ff] mt-0.5">
                  {result.auraScore}
                </div>
                <p className="text-xs sm:text-sm text-[#77788b] mt-3 font-medium leading-relaxed max-w-md mx-auto">
                  {result.description}
                </p>
              </div>

              {/* Top Matched B-Schools */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#17172b] flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Your Top 3 Matching B-Schools</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#7456ff]">98% Fit Rating</span>
                </div>

                <div className="space-y-2.5">
                  {matchedColleges.map((col) => {
                    const isFaved = isShortlisted(col.id);
                    return (
                      <div
                        key={col.id}
                        className="p-3.5 bg-white rounded-2xl border-2 border-[#17172b]/15 flex items-center justify-between gap-3 hover:border-[#17172b] transition-all"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#77788b] uppercase tracking-wider">
                            {col.city} • Min {col.minPercentile}%ile
                          </span>
                          <h5 className="font-extrabold text-xs sm:text-sm text-[#17172b] truncate">
                            {col.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-emerald-700">
                              Avg ₹{col.avgPackageLpa} LPA
                            </span>
                            <span className="text-[11px] text-[#77788b]">•</span>
                            <span className="text-[11px] font-bold text-[#7456ff]">
                              ₹{((col.programmes[0]?.totalFeeInr || 0) / 100000).toFixed(1)}L Fee
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            SoundFX.pop();
                            toggleShortlist(col.id);
                            showToast(
                              isFaved ? 'Removed from shortlist' : 'Saved to your shortlist! ✨',
                              'success'
                            );
                          }}
                          aria-label={isFaved ? 'Remove from shortlist' : 'Add to shortlist'}
                          className="p-2.5 rounded-xl border border-[#17172b]/20 hover:bg-[#eeebff] transition-colors shrink-0"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFaved ? 'fill-[#ff8dc7] text-[#ff8dc7]' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 pop-shadow border-2 border-[#17172b] !text-sm"
                  icon={<Sparkles className="w-4 h-4 text-[#d9ff64]" />}
                  onClick={handleApplyToColleges}
                >
                  Apply to All 3 in 1 Form ⚡
                </Button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-2xl border-2 border-[#17172b] pop-shadow-sm hover:bg-[#d9ff64] text-[#17172b] transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Aura</span>
                  </button>
                  <button
                    onClick={handleReset}
                    title="Retake vibe check"
                    aria-label="Retake vibe check"
                    className="p-3 rounded-2xl border-2 border-[#17172b]/20 hover:border-[#17172b] text-[#77788b] hover:text-[#17172b] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
