import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Layers,
  FileCheck2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Award,
  ShieldAlert,
  Zap,
  Flame,
  Calculator,
  Smile,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CollegeCard } from '../components/cards/CollegeCard';
import { COLLEGES_DATA } from '../data/colleges';
import { QUESTIONS_DATA } from '../data/questions';
import { ProgrammeType } from '../types';
import { VibeCheckModal } from '../components/home/VibeCheckModal';
import { SoundFX } from '../utils/sound';

export const Home: React.FC = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<'All' | ProgrammeType>('All');
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);

  // Gen Z Speedrun & Sanity Calculator State
  const [targetCollegesCount, setTargetCollegesCount] = useState<number>(5);

  // Speedrun savings calculation
  const hoursSaved = Math.max(0, (targetCollegesCount - 1) * 3.5);
  const oldFeeEst = targetCollegesCount * 1800;
  const cmcFee = 1500;
  const cashSaved = Math.max(0, oldFeeEst - cmcFee);
  const fieldsSaved = Math.max(0, (targetCollegesCount - 1) * 62);

  // Gen Z Interactive Quick ROI Calculator State
  const [calcFeeLakh, setCalcFeeLakh] = useState<number>(15);
  const [calcCtcLpa, setCalcCtcLpa] = useState<number>(18);

  // Simple, realistic payback calculation
  // Rough estimate: In-hand monthly ~ (CTC * 0.72) / 12, Living cost ~ ₹40k, Disposable for EMI/Savings ~ (In-hand - 40k)
  const estimatedMonthlyInHand = Math.round((calcCtcLpa * 100000 * 0.74) / 12);
  const estimatedPaybackMonths = Math.max(
    8,
    Math.round((calcFeeLakh * 100000) / Math.max(25000, estimatedMonthlyInHand - 40000))
  );

  const filteredColleges = COLLEGES_DATA.filter((c) => {
    if (selectedProgramme === 'All') return true;
    return c.programmes.some((p) => p.type === selectedProgramme);
  });

  const teaserQuestions = QUESTIONS_DATA.slice(0, 3);

  const marqueeItems = [
    '⚡ 1 FORM TO RULE THEM ALL',
    '💅 NO CAP PLACEMENT METRICS',
    '🎯 APPLY TO 5 B-SCHOOLS WITH 1 FEE',
    '🚀 SKIP 10 REPETITIVE FORMS',
    '🔥 AI SOP POLISHER WITH GEMINI',
    '💯 REAL CTC & IN-HAND VERIFICATION',
    '☕ BEST CAMPUS VIBES & CULTURE',
    '⚡ CONFIRM YOUR DREAM ADMISSION',
  ];

  return (
    <div className="flex flex-col gap-14 sm:gap-20 overflow-x-hidden text-left">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="pt-4 sm:pt-8 pb-2 relative">
        {/* Floating Gen Z Decorative Stickers for Desktop */}
        <div className="hidden xl:block absolute top-10 right-12 z-20 pointer-events-none">
          <div className="bg-[#ff8dc7] text-[#17172b] px-3.5 py-1.5 rounded-2xl sticker-badge rotate-6 text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-current text-orange-600" />
            <span>Zero Form Fatigue 🔥</span>
          </div>
        </div>

        <div className="hidden xl:block absolute top-40 left-8 z-20 pointer-events-none">
          <div className="bg-[#d9ff64] text-[#17172b] px-3.5 py-1.5 rounded-2xl sticker-badge -rotate-6 text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-current text-yellow-600" />
            <span>5 B-Schools • 1 Common Fee</span>
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-5 sm:gap-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 bg-[#d9ff64] text-[#17172b] px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-[#17172b] pop-shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#7456ff]" />
                <span>Apply to 5 B-Schools with 1 Form — No Cap</span>
              </div>

              {/* Main Heading with Lime Highlight */}
              <h1 className="text-[36px] sm:text-[54px] lg:text-[66px] font-black text-[#17172b] tracking-[-0.04em] leading-[1.03]">
                Your Dream <span className="hero-highlight">B-School</span> Is Closer Than You Think!
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#77788b] leading-relaxed max-w-xl font-medium">
                Skip typing the exact same 10th marks, graduation degrees, and CAT roll numbers across 10
                separate long forms. Explore verified programmes, compare realistic CTCs, and apply in one go.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link to="/explore" className="w-full sm:w-auto" onClick={() => SoundFX.pop()}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto pop-shadow border-2 border-[#17172b] !text-base"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Find B-School 🚀
                  </Button>
                </Link>
                <Link to="/apply" className="w-full sm:w-auto" onClick={() => SoundFX.pop()}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-[#17172b] pop-shadow-sm !text-base hover:bg-[#d9ff64]"
                  >
                    Start 1 Form ⚡
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    SoundFX.pop();
                    setIsVibeModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 bg-[#d9ff64] hover:bg-white text-[#17172b] font-black text-sm rounded-[14px] border-2 border-[#17172b] pop-shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#7456ff]" />
                  <span>30s Vibe Check ✨</span>
                </button>
              </div>

              {/* Social Proof Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-block h-9 w-9 rounded-full border-2 border-[#17172b] bg-[#7456ff] text-white text-xs font-black flex items-center justify-center">
                    AK
                  </div>
                  <div className="inline-block h-9 w-9 rounded-full border-2 border-[#17172b] bg-[#d9ff64] text-[#17172b] text-xs font-black flex items-center justify-center">
                    PS
                  </div>
                  <div className="inline-block h-9 w-9 rounded-full border-2 border-[#17172b] bg-[#ff8dc7] text-white text-xs font-black flex items-center justify-center">
                    RN
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#17172b] flex items-center gap-1.5">
                  <span>Join 2,400+ MBA aspirants saving 20+ hrs</span>
                  <span className="hidden sm:inline bg-[#eeebff] text-[#7456ff] px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                    🔥 Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Gen Z Illustration & Sticker Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square bg-gradient-to-br from-[#eeebff] via-white to-[#d9ff64]/30 rounded-[32px] border-2 border-[#17172b] pop-shadow p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden">
                {/* SVG Illustration */}
                <svg
                  className="w-full h-full max-h-60"
                  viewBox="0 0 400 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="200" cy="160" r="130" fill="#7456ff" fillOpacity="0.08" />
                  <rect
                    x="65"
                    y="65"
                    width="270"
                    height="180"
                    rx="22"
                    fill="white"
                    stroke="#17172b"
                    strokeWidth="2.5"
                  />
                  <rect x="65" y="65" width="270" height="38" rx="22" fill="#d9ff64" stroke="#17172b" strokeWidth="2.5" />
                  <circle cx="95" cy="84" r="5" fill="#ff8dc7" stroke="#17172b" strokeWidth="1.5" />
                  <circle cx="112" cy="84" r="5" fill="#7456ff" stroke="#17172b" strokeWidth="1.5" />
                  <circle cx="129" cy="84" r="5" fill="white" stroke="#17172b" strokeWidth="1.5" />
                  {/* Common Form Lines */}
                  <rect x="95" y="125" width="130" height="12" rx="6" fill="#17172b" />
                  <rect x="95" y="148" width="100" height="9" rx="4.5" fill="#7456ff" fillOpacity="0.6" />
                  <rect x="95" y="168" width="150" height="9" rx="4.5" fill="#77788b" fillOpacity="0.3" />
                  <rect x="95" y="188" width="80" height="9" rx="4.5" fill="#77788b" fillOpacity="0.3" />
                  <rect x="95" y="210" width="105" height="20" rx="8" fill="#7456ff" />
                  {/* Floating Cap Badge */}
                  <g transform="translate(230, 115)">
                    <rect width="84" height="84" rx="20" fill="#ff8dc7" stroke="#17172b" strokeWidth="2.5" />
                    <path d="M42 26L66 37L42 48L18 37L42 26Z" fill="#17172b" />
                    <path
                      d="M27 41V54C27 60 34 63 42 63C50 63 57 60 57 54V41"
                      stroke="#17172b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path d="M60 39V52" stroke="#17172b" strokeWidth="3" />
                  </g>
                </svg>

                {/* Floating Neo-Pop Badge */}
                <div className="absolute bottom-5 left-5 bg-white px-4 py-2.5 rounded-2xl border-2 border-[#17172b] pop-shadow-sm -rotate-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-[#17172b]">
                    Bigger Dreams, Better Choices 💅
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE TICKER BANNER ================= */}
      <div className="bg-[#d9ff64] border-y-2 border-[#17172b] py-3 overflow-hidden select-none -mx-2">
        <div className="animate-marquee gap-8">
          {[...marqueeItems, ...marqueeItems].map((text, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm font-black text-[#17172b] uppercase tracking-wider whitespace-nowrap"
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ================= 2. QUICK-ACTION STRIP ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/explore"
              className="bg-white p-5 rounded-[24px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#eeebff] text-[#7456ff] border border-[#17172b]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17172b] group-hover:text-[#7456ff] transition-colors">
                  Discover B-Schools
                </h3>
                <p className="text-xs text-[#77788b] mt-1 font-medium">Cutoffs, verified fees & placement stats</p>
              </div>
            </Link>

            <Link
              to="/compare"
              className="bg-white p-5 rounded-[24px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#d9ff64] text-[#17172b] border border-[#17172b]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17172b] group-hover:text-[#7456ff] transition-colors">
                  Compare 5 Side-by-Side
                </h3>
                <p className="text-xs text-[#77788b] mt-1 font-medium">Cut the BS: Compare ROI, CTC & campus vibes</p>
              </div>
            </Link>

            <Link
              to="/apply"
              className="bg-white p-5 rounded-[24px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ff8dc7]/40 text-[#17172b] border border-[#17172b]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17172b] group-hover:text-[#7456ff] transition-colors">
                  1 Common Application
                </h3>
                <p className="text-xs text-[#77788b] mt-1 font-medium">Apply to up to 5 colleges with 1 fee</p>
              </div>
            </Link>

            <Link
              to="/quiz"
              className="bg-white p-5 rounded-[24px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-200 text-[#17172b] border border-[#17172b]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17172b] group-hover:text-[#7456ff] transition-colors">
                  AI Vibe Check Quiz
                </h3>
                <p className="text-xs text-[#77788b] mt-1 font-medium">Gemini-backed personalized matching in 2 mins</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 3. POPULAR MBA/PGDM PROGRAMMES ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7456ff] bg-[#eeebff] px-3 py-1 rounded-full mb-1">
                <span>Top Curated Cohorts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#17172b]">
                Popular MBA/PGDM Programmes
              </h2>
              <p className="text-xs sm:text-sm text-[#77788b] mt-1 font-medium">
                Find the right programme for your career goals
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(['All', 'MBA', 'PGDM', 'Executive MBA', 'Online MBA'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedProgramme(type)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                    selectedProgramme === type
                      ? 'bg-[#17172b] text-[#d9ff64] border border-[#17172b] pop-shadow-sm'
                      : 'bg-white text-[#17172b] border border-[#e9e7f4] hover:border-[#17172b]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.slice(0, 6).map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/explore">
              <Button
                variant="secondary"
                size="md"
                className="border-2 border-[#17172b] pop-shadow-sm hover:bg-[#d9ff64]"
              >
                Explore All 12 Partner B-Schools →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 3B. GEN Z SPEEDRUN & SANITY CALCULATOR ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="bg-gradient-to-br from-[#17172b] via-[#24243e] to-[#17172b] text-white rounded-[32px] p-6 sm:p-10 border-2 border-[#17172b] pop-shadow relative overflow-hidden">
            {/* Background decorative glows */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#7456ff]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#d9ff64]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#d9ff64] text-[#17172b] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Speedrun Mode • Zero Cap</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Common App vs <span className="text-[#d9ff64]">Form Fatigue</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">
                  Indian MBA applicants spend 20+ hours retyping the same 10th/12th/CAT marks. See what ConfirmMyCollege saves you:
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 shrink-0 self-start sm:self-auto">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
                <span className="text-xs font-black text-[#d9ff64]">
                  Sanity Score: 100/100 💅
                </span>
              </div>
            </div>

            {/* Slider Row */}
            <div className="py-6 border-b border-white/10 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-200">
                  How many colleges are you applying to?
                </label>
                <span className="text-base sm:text-lg font-black text-[#17172b] bg-[#d9ff64] px-4 py-1 rounded-xl border border-white">
                  {targetCollegesCount} B-Schools 🎯
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={targetCollegesCount}
                onChange={(e) => {
                  SoundFX.tick();
                  setTargetCollegesCount(parseInt(e.target.value, 10));
                }}
                className="w-full accent-[#d9ff64] cursor-pointer h-2 bg-white/20 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-2">
                <span>1 College (Solo)</span>
                <span>3 Colleges</span>
                <span>5 Colleges (Common Package)</span>
                <span>8 Colleges (Ambitious)</span>
              </div>
            </div>

            {/* 4 Bento Result Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 relative z-10">
              {/* Tile 1: Hours Saved */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 hover:border-[#d9ff64] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">Time Saved</span>
                  <Clock className="w-4 h-4 text-[#d9ff64]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#d9ff64]">
                  ~{hoursSaved.toFixed(1)} Hours
                </div>
                <p className="text-[11px] text-gray-300 mt-1 font-medium leading-snug">
                  Zero duplicate typing of graduation & CAT marks across separate websites.
                </p>
              </div>

              {/* Tile 2: Cash Saved */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 hover:border-[#ff8dc7] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">Cash Saved</span>
                  <TrendingUp className="w-4 h-4 text-[#ff8dc7]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#ff8dc7]">
                  ₹{cashSaved.toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-300 mt-1 font-medium leading-snug">
                  1 bundled fee of ₹1,500 vs paying ₹1,800 to every separate college.
                </p>
              </div>

              {/* Tile 3: Form Fields Skipped */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 hover:border-sky-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">Inputs Skipped</span>
                  <FileCheck2 className="w-4 h-4 text-sky-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-sky-300">
                  {fieldsSaved} Fields
                </div>
                <p className="text-[11px] text-gray-300 mt-1 font-medium leading-snug">
                  Addresses, parents' details, work exp logs filled strictly once.
                </p>
              </div>

              {/* Tile 4: Mental Sanity */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">Brain Sanity</span>
                  <Smile className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                  100% Aura ✨
                </div>
                <p className="text-[11px] text-gray-300 mt-1 font-medium leading-snug">
                  1 single tracker dashboard instead of 8 confusing passwords & OTPs.
                </p>
              </div>
            </div>

            {/* Bottom CTA bar */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <span className="text-xs text-gray-300 font-semibold text-center sm:text-left">
                ⚡ Ready to eliminate repetitive forms? Apply to your top 5 colleges today.
              </span>
              <Link to="/apply" onClick={() => SoundFX.pop()} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto !bg-[#d9ff64] !text-[#17172b] hover:!bg-white font-black border-2 border-white pop-shadow-sm !text-sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Common Form Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. GEN Z ROI & PAYBACK ESTIMATOR WIDGET ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="bg-white rounded-[32px] border-2 border-[#17172b] pop-shadow p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e9e7f4]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#17172b] bg-[#d9ff64] px-3 py-1 rounded-full border border-[#17172b] mb-1">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Gen Z Reality Check</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#17172b]">
                  True MBA ROI & Payback Calculator
                </h2>
                <p className="text-xs text-[#77788b] mt-0.5">
                  Calculate realistic in-hand post-tax cashflow and how quickly your tuition is repaid.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#eeebff] px-3.5 py-1.5 rounded-2xl text-xs font-bold text-[#7456ff] shrink-0">
                <TrendingUp className="w-4 h-4" />
                <span>Instant Financial Forecast</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Input */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#17172b] uppercase tracking-wider">
                      Total MBA Tuition & Hostel Budget
                    </span>
                    <span className="text-sm font-extrabold text-[#7456ff] bg-[#eeebff] px-2.5 py-0.5 rounded-lg border border-[#7456ff]/30">
                      ₹{calcFeeLakh} Lakh
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="25"
                    step="1"
                    value={calcFeeLakh}
                    onChange={(e) => setCalcFeeLakh(parseInt(e.target.value, 10))}
                    className="w-full accent-[#7456ff] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#77788b] mt-1 font-semibold">
                    <span>₹6L (Budget)</span>
                    <span>₹15L (Average)</span>
                    <span>₹25L (Flagship)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#17172b] uppercase tracking-wider">
                      Expected Average Placement Package (CTC)
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      ₹{calcCtcLpa} LPA
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="28"
                    step="1"
                    value={calcCtcLpa}
                    onChange={(e) => setCalcCtcLpa(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#77788b] mt-1 font-semibold">
                    <span>₹8 LPA</span>
                    <span>₹18 LPA</span>
                    <span>₹28 LPA</span>
                  </div>
                </div>
              </div>

              {/* Calculated Results Card */}
              <div className="lg:col-span-5 bg-[#f8f7ff] rounded-2xl p-6 border-2 border-[#17172b] space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-[#77788b] uppercase block">
                    Estimated In-Hand Salary
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#17172b] mt-0.5">
                    ~₹{estimatedMonthlyInHand.toLocaleString()} / mo
                  </p>
                  <span className="text-[10px] text-[#77788b]">Post-tax & basic deductions (approx)</span>
                </div>

                <div className="pt-3 border-t border-[#e9e7f4]">
                  <span className="text-[11px] font-bold text-[#77788b] uppercase block">
                    Estimated Payback Period
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#7456ff] mt-0.5">
                    {estimatedPaybackMonths} Months
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    {(estimatedPaybackMonths / 12).toFixed(1)} years to break even on tuition 🎯
                  </span>
                </div>

                <Link to="/explore" className="block pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full pop-shadow-sm border border-[#17172b]"
                  >
                    View Colleges Matching This CTC →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. QUIZ BANNER (LIME-TINTED) ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="bg-[#d9ff64] rounded-[32px] p-8 sm:p-12 border-2 border-[#17172b] pop-shadow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex-1 max-w-xl z-10">
              <span className="inline-block text-[11px] font-extrabold bg-[#17172b] text-white px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Smart Match Algorithm ⚡
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#17172b] tracking-tight leading-tight">
                Can’t decide which college is right for you?
              </h2>
              <p className="text-sm sm:text-base text-[#17172b]/80 mt-2 font-semibold">
                Take our quick quiz and get personalised college recommendations based on your scores,
                budget, and career aspirations.
              </p>
            </div>

            <div className="z-10 shrink-0">
              <Link to="/quiz">
                <Button
                  variant="dark"
                  size="lg"
                  className="pop-shadow-sm border border-[#17172b] !text-base"
                  icon={<Sparkles className="w-5 h-5 text-[#d9ff64]" />}
                >
                  Start Quiz →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. HOW IT WORKS ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-[#17172b]">How It Works</h2>
          <p className="text-xs sm:text-sm text-[#77788b] mt-1 max-w-md mx-auto font-medium">
            Applying to multiple top business schools in India has never been this straightforward.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-[26px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-[#eeebff] text-[#7456ff] border-2 border-[#17172b] font-black text-xl flex items-center justify-center mb-5 pop-shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-lg text-[#17172b] mb-2">Explore Colleges</h3>
              <p className="text-xs sm:text-sm text-[#77788b] leading-relaxed font-medium">
                Filter by percentile cutoffs, cities, fee budgets, and placement packages. Compare up to
                5 colleges side by side to choose your target list.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-[26px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-[#d9ff64] text-[#17172b] border-2 border-[#17172b] font-black text-xl flex items-center justify-center mb-5 pop-shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-lg text-[#17172b] mb-2">Fill Common Application</h3>
              <p className="text-xs sm:text-sm text-[#77788b] leading-relaxed font-medium">
                Enter your personal, academic, and entrance exam credentials once. Upload marksheet
                documents and review your SOP with AI.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-[26px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow transition-all relative">
              <div className="w-12 h-12 rounded-2xl bg-[#ff8dc7] text-[#17172b] border-2 border-[#17172b] font-black text-xl flex items-center justify-center mb-5 pop-shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-lg text-[#17172b] mb-2">Get Shortlisted & Apply</h3>
              <p className="text-xs sm:text-sm text-[#77788b] leading-relaxed font-medium">
                Submit with one single application fee. Track interview calls and provisional admission
                shortlists in your unified dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. QUESTION CORNER TEASER ================= */}
      <section className="bg-white py-14 border-y-2 border-[#17172b]/10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7456ff] bg-[#eeebff] px-3 py-1 rounded-full mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Admission Test Prep</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#17172b]">Question Corner</h2>
              <p className="text-xs sm:text-sm text-[#77788b] mt-1 font-medium">
                Practise high-frequency questions that repeat across CAT, XAT, SNAP & CMAT.
              </p>
            </div>

            <Link to="/questions">
              <Button
                variant="secondary"
                size="md"
                className="border-2 border-[#17172b] pop-shadow-sm hover:bg-[#d9ff64]"
              >
                Explore All 60+ Questions →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teaserQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-[#f8f7ff] p-5 rounded-[22px] border-2 border-[#17172b]/15 hover:border-[#17172b] pop-shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-extrabold bg-[#eeebff] text-[#7456ff] px-2.5 py-0.5 rounded-lg border border-[#7456ff]/20">
                      {q.exam} · {q.section}
                    </span>
                    <span className="text-[11px] font-bold text-[#77788b]">{q.difficulty}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#17172b] line-clamp-3 mb-4">{q.text}</h4>
                </div>

                <Link to={`/questions?qid=${q.id}`} className="pt-2 border-t border-[#e9e7f4]">
                  <span className="text-xs font-bold text-[#7456ff] hover:underline flex items-center gap-1">
                    Practise now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 8. FEE CALLOUT (DARK INK BAND) ================= */}
      <section>
        <div className="max-w-[1180px] mx-auto px-4 sm:px-7">
          <div className="bg-[#17172b] rounded-[32px] p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-[#17172b] pop-shadow relative overflow-hidden">
            <div className="max-w-xl z-10">
              <div className="inline-flex items-center gap-2 bg-[#d9ff64] text-[#17172b] px-3.5 py-1.5 rounded-full text-xs font-black mb-4">
                <Award className="w-4 h-4" />
                <span>Single Fee Advantage ⚡</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Pay one application fee. Apply to up to five B-schools.
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed font-medium">
                Save hours of duplicate data entry and hundreds of rupees in redundant application costs.
                Fill your credentials once, choose your favourite five colleges, and confirm in one click.
              </p>
              <p className="text-[11px] text-gray-400 mt-4">
                Package price: ₹1,500 set by admin · No guarantee of admission · Demo content
              </p>
            </div>

            <div className="shrink-0 z-10 flex flex-col items-center gap-3 w-full md:w-auto">
              <Link to="/apply" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-[#7456ff] hover:bg-[#6046e8] border-2 border-white pop-shadow-sm !text-base"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Start Common Application
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#d9ff64]" />
                <span>Covers up to 5 participating colleges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Badge */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-7 -mt-6">
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 flex items-center gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Demo Disclaimer:</strong> ConfirmMyCollege is a prototype portal. Selection cutoffs,
            tuition figures, and colleges are for demo representation. <strong>No guarantee of admission.</strong>
          </span>
        </div>
      </div>

      {/* Interactive Gen-Z Vibe Check Modal */}
      <VibeCheckModal
        isOpen={isVibeModalOpen}
        onClose={() => setIsVibeModalOpen(false)}
      />
    </div>
  );
};
