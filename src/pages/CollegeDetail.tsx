import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { COLLEGES_DATA } from '../data/colleges';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CollegeCard } from '../components/cards/CollegeCard';
import { useShortlistStore } from '../store/shortlistStore';
import { useApplicationStore } from '../store/applicationStore';
import { useToast } from '../components/ui/Toast';
import { SoundFX } from '../utils/sound';

export const CollegeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const college = COLLEGES_DATA.find((c) => c.id === id);

  const { shortlist, toggleShortlist, compareList, addCompare, removeCompare } = useShortlistStore();
  const { addChoice, setStep } = useApplicationStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'programmes' | 'eligibility' | 'process' | 'dates' | 'faqs'
  >('overview');

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!college) {
    return (
      <div className="max-w-[1180px] mx-auto px-5 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#17172b]">College Not Found</h2>
        <p className="text-sm text-[#77788b] mt-2 mb-6">
          The requested B-school does not exist or has been removed from our demo index.
        </p>
        <Link to="/explore">
          <Button variant="primary">Return to Explore</Button>
        </Link>
      </div>
    );
  }

  const isFavorited = shortlist.includes(college.id);
  const isCompared = compareList.includes(college.id);

  const handleApplyNow = () => {
    const res = addChoice(college.id, college.programmes[0]?.type || 'PGDM');
    if (!res.success) {
      showToast(res.message || 'Maximum 5 colleges reached.', 'warning');
    } else {
      showToast(`Added ${college.shortName} to your Common Application!`, 'success');
    }
    setStep(7);
    navigate('/apply');
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeCompare(college.id);
      showToast(`Removed ${college.shortName} from comparison.`, 'info');
    } else {
      const res = addCompare(college.id);
      if (!res.success) {
        showToast(res.message || 'Cannot add more than 5 colleges.', 'warning');
      } else {
        showToast(`Added ${college.shortName} to comparison list.`, 'success');
      }
    }
  };

  const similarColleges = COLLEGES_DATA.filter(
    (c) => c.id !== college.id && (c.city === college.city || Math.abs(c.minPercentile - college.minPercentile) <= 5)
  ).slice(0, 3);

  // Logo palette
  const palette = ['#7456ff', '#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed'];
  const colorIndex = Math.abs(college.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palette.length;
  const logoBg = palette[colorIndex];

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left">
      {/* ================= HEADER BAND ================= */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] shadow-[0_12px_32px_rgba(33,25,76,0.06)] p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info */}
          <div className="flex items-start gap-4">
            <div
              style={{ backgroundColor: logoBg }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shrink-0 shadow-md"
            >
              {college.shortName.substring(0, 4)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#77788b] uppercase tracking-wider">
                  {college.state}
                </span>
                <span className="text-gray-300">•</span>
                <Badge variant="purple" size="sm">
                  {college.programmes[0]?.type}
                </Badge>
                <Badge variant="lime" size="sm">
                  Min {college.minPercentile}%ile
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b] tracking-tight leading-tight">
                {college.name}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#77788b] mt-1.5">
                <MapPin className="w-4 h-4 text-[#7456ff]" />
                <span>{college.city}, {college.state}</span>
                <span className="text-gray-300">•</span>
                <span>Hostel: {college.hostel ? 'Available on-campus' : 'Verified off-campus'}</span>
              </div>
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e9e7f4]">
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleApplyNow}
            >
              Add to My 5 & Apply
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Layers className={`w-4 h-4 ${isCompared ? 'text-[#7456ff]' : ''}`} />}
              onClick={handleCompareToggle}
            >
              {isCompared ? 'Comparing' : 'Compare'}
            </Button>

            <button
              onClick={() => {
                toggleShortlist(college.id);
                showToast(
                  isFavorited ? 'Removed from shortlist' : 'Added to shortlist',
                  isFavorited ? 'info' : 'success'
                );
              }}
              aria-label={isFavorited ? 'Remove from shortlist' : 'Add to shortlist'}
              className="p-3 rounded-xl border border-[#e9e7f4] hover:bg-[#eeebff] text-gray-400 hover:text-[#7456ff] transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isFavorited ? 'fill-[#7456ff] text-[#7456ff]' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e9e7f4]">
          <div className="bg-[#f8f7ff] p-3.5 rounded-2xl border border-[#e9e7f4]/60">
            <span className="text-[11px] font-semibold text-[#77788b] block">Total Programme Fee</span>
            <span className="text-base font-bold text-[#17172b]">
              ₹{((college.programmes[0]?.totalFeeInr || 0) / 100000).toFixed(1)} Lakh
            </span>
          </div>

          <div className="bg-[#f8f7ff] p-3.5 rounded-2xl border border-[#e9e7f4]/60">
            <span className="text-[11px] font-semibold text-[#77788b] block">Average Package</span>
            <span className="text-base font-bold text-emerald-700">₹{college.avgPackageLpa} LPA</span>
          </div>

          <div className="bg-[#f8f7ff] p-3.5 rounded-2xl border border-[#e9e7f4]/60">
            <span className="text-[11px] font-semibold text-[#77788b] block">Highest CTC</span>
            <span className="text-base font-bold text-[#7456ff]">₹{college.highestPackageLpa} LPA</span>
          </div>

          <div className="bg-[#f8f7ff] p-3.5 rounded-2xl border border-[#e9e7f4]/60">
            <span className="text-[11px] font-semibold text-[#77788b] block">Exams Accepted</span>
            <span className="text-xs font-bold text-[#17172b] truncate block mt-0.5">
              {college.examsAccepted.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex border-b border-[#e9e7f4] gap-2 overflow-x-auto no-scrollbar mb-8">
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'programmes', label: 'Programmes & Fees' },
            { id: 'eligibility', label: 'Eligibility' },
            { id: 'process', label: 'Admission Process' },
            { id: 'dates', label: 'Important Dates' },
            { id: 'faqs', label: 'FAQs' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#7456ff] text-[#7456ff]'
                : 'border-transparent text-[#77788b] hover:text-[#17172b]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB CONTENTS ================= */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-10 shadow-[0_8px_24px_rgba(33,25,76,0.04)] mb-12 relative">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#17172b] mb-2">About the Institution</h2>
              <p className="text-sm text-[#77788b] leading-relaxed">
                {college.name} is one of the premier business education establishments located in{' '}
                {college.city}, {college.state}. Designed with state-of-the-art case study auditoriums,
                simulation labs, and corporate incubation facilities, the institution prepares forward-thinking
                graduates for fast-track careers in modern enterprise leadership.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#17172b] mb-3">Key Highlights & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {college.tags.map((tag) => (
                  <Badge key={tag} variant="purple" size="md">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="lime" size="md">
                  AICTE Approved
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] flex items-center justify-between text-xs text-[#77788b]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified partner data for Common Application</span>
              </span>
              <span className="font-semibold">Last verified: demo</span>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRAMMES & FEES */}
        {activeTab === 'programmes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#17172b] mb-1">Offered Programmes & Fee Structure</h2>
              <p className="text-xs text-[#77788b]">
                Tuition fees cover academic materials, digital library subscriptions, and corporate immersions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#e9e7f4] bg-[#f8f7ff] text-[#77788b]">
                    <th className="p-3.5 font-bold">Programme Name</th>
                    <th className="p-3.5 font-bold">Type</th>
                    <th className="p-3.5 font-bold">Duration</th>
                    <th className="p-3.5 font-bold">Total Fee</th>
                    <th className="p-3.5 font-bold">Sanctioned Seats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e7f4]">
                  {college.programmes.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60">
                      <td className="p-3.5 font-bold text-[#17172b]">{p.name}</td>
                      <td className="p-3.5">
                        <Badge variant="purple" size="sm">
                          {p.type}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-[#77788b]">{p.durationYears} Years</td>
                      <td className="p-3.5 font-bold text-[#7456ff]">
                        ₹{(p.totalFeeInr / 100000).toFixed(2)} Lakh
                      </td>
                      <td className="p-3.5 text-[#17172b] font-medium">{p.seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#77788b] italic">
              * Installment options and bank educational loans available through verified lender tie-ups.
            </p>
          </div>
        )}

        {/* TAB 3: ELIGIBILITY */}
        {activeTab === 'eligibility' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#17172b]">Eligibility Criteria (2026-2028 Cohort)</h2>
            <div className="space-y-3">
              {college.eligibility.map((crit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f8f7ff] border border-[#e9e7f4]/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-[#17172b] leading-relaxed">{crit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADMISSION PROCESS */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#17172b]">5-Step Admission Journey</h2>
            <div className="space-y-4">
              {college.admissionProcess.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl border border-[#e9e7f4] bg-white">
                  <div className="w-8 h-8 rounded-xl bg-[#7456ff] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#17172b]">Phase {idx + 1}</h3>
                    <p className="text-sm text-[#77788b] mt-0.5 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: IMPORTANT DATES */}
        {activeTab === 'dates' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#17172b]">Admissions Calendar & Timeline</h2>
            <div className="relative border-l-2 border-[#7456ff]/30 ml-4 pl-6 space-y-6">
              {college.importantDates.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#7456ff] border-2 border-white" />
                  <span className="text-xs font-bold text-[#7456ff] block">{item.date}</span>
                  <h3 className="text-sm font-bold text-[#17172b] mt-0.5">{item.label}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#17172b] mb-2">Frequently Asked Questions</h2>
            {college.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-[#e9e7f4] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-[#17172b] flex items-center justify-between gap-4 hover:bg-gray-50/50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#7456ff] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-[#77788b] leading-relaxed border-t border-[#e9e7f4]/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Demo Content Footer Tag */}
        <div className="flex justify-between items-center text-[11px] text-[#77788b]/60 border-t border-[#e9e7f4] pt-4 mt-8">
          <span>Demo content</span>
          <span>Last verified: demo</span>
        </div>
      </div>

      {/* ================= SIMILAR COLLEGES ROW ================= */}
      {similarColleges.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#17172b]">Similar B-Schools</h2>
            <Link to="/explore" className="text-xs font-bold text-[#7456ff] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarColleges.map((sim) => (
              <CollegeCard key={sim.id} college={sim} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Action Strip */}
      <div className="fixed bottom-14 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t-2 border-[#17172b]/15 px-4 py-2.5 flex items-center justify-between shadow-[0_-8px_20px_rgba(23,23,43,0.08)]">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#77788b] block">Total Tuition</span>
          <span className="text-sm font-extrabold text-[#17172b]">
            ₹{((college.programmes[0]?.totalFeeInr || 0) / 100000).toFixed(1)}L · {college.minPercentile}%ile
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundFX.pop();
              handleCompareToggle();
            }}
            className="p-2.5 rounded-xl border border-[#17172b]/20 bg-[#f8f7ff] text-[#17172b] cursor-pointer"
            aria-label="Compare"
          >
            <Layers className={`w-4 h-4 ${isCompared ? 'text-[#7456ff]' : ''}`} />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              SoundFX.pop();
              handleApplyNow();
            }}
            className="pop-shadow-sm !py-2 !text-xs font-black"
            icon={<Sparkles className="w-3.5 h-3.5 text-[#d9ff64]" />}
          >
            Apply in 1 Form ⚡
          </Button>
        </div>
      </div>
    </div>
  );
};
