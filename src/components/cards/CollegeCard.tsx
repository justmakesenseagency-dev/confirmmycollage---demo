import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Clock, CheckSquare, Square, IndianRupee, Briefcase, Zap, Flame } from 'lucide-react';
import { College } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useShortlistStore } from '../../store/shortlistStore';
import { useToast } from '../ui/Toast';
import { SoundFX } from '../../utils/sound';

interface CollegeCardProps {
  college: College;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college }) => {
  const { shortlist, toggleShortlist, compareList, addCompare, removeCompare } = useShortlistStore();
  const { showToast } = useToast();

  const isFavorited = shortlist.includes(college.id);
  const isCompared = compareList.includes(college.id);

  // Calculate days left to deadline
  const deadlineDate = new Date(college.applicationDeadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft > 0 && daysLeft <= 14;

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundFX.pop();
    if (isCompared) {
      removeCompare(college.id);
      showToast(`Removed ${college.shortName} from comparison.`, 'info');
    } else {
      const res = addCompare(college.id);
      if (!res.success) {
        showToast(res.message || 'Cannot add more than 5 colleges to compare.', 'warning');
      } else {
        showToast(`Added ${college.shortName} to compare (total ${compareList.length + 1}).`, 'success');
      }
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundFX.pop();
    toggleShortlist(college.id);
    showToast(
      isFavorited
        ? `Removed ${college.shortName} from shortlist.`
        : `Added ${college.shortName} to your shortlist! ✨`,
      isFavorited ? 'info' : 'success'
    );
  };

  // Generate deterministic pastel logo color
  const palette = ['#7456ff', '#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed'];
  const colorIndex = Math.abs(college.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palette.length;
  const logoBg = palette[colorIndex];
  const initials = college.shortName.substring(0, 4);

  // Gen Z Vibe Tag based on college specialty
  const getVibeBadge = () => {
    if (college.avgPackageLpa >= 16) return { label: '🔥 High CTC / Tier 1', color: 'bg-[#ff8dc7]/30 text-[#cc3580]' };
    if (college.tags.includes('Entrepreneurship')) return { label: '🚀 Founder Hub', color: 'bg-[#d9ff64] text-[#17172b]' };
    if (college.tags.includes('Tech MBA') || college.tags.includes('FinTech Pioneer')) return { label: '⚡ AI & Tech Era', color: 'bg-sky-100 text-sky-800' };
    return { label: '💅 Top ROI Match', color: 'bg-[#eeebff] text-[#7456ff]' };
  };

  const vibe = getVibeBadge();

  return (
    <div className="group bg-white rounded-[24px] border-2 border-[#17172b]/10 hover:border-[#17172b] pop-shadow transition-all duration-200 flex flex-col justify-between overflow-hidden relative text-left">
      {/* Top Header */}
      <div className="p-5 pb-3">
        {/* Vibe badge & Shortlist heart */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#17172b]/20 tracking-tight flex items-center gap-1 ${vibe.color}`}>
            {vibe.label}
          </span>

          <button
            onClick={handleFavoriteToggle}
            aria-label={isFavorited ? 'Remove from shortlist' : 'Add to shortlist'}
            className="p-1.5 rounded-full hover:bg-[#eeebff] transition-all text-gray-400 hover:text-[#ff8dc7]"
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isFavorited ? 'fill-[#ff8dc7] text-[#ff8dc7]' : ''
              }`}
            />
          </button>
        </div>

        {/* College Name & Logo */}
        <div className="flex items-start gap-3 mb-3">
          <div
            style={{ backgroundColor: logoBg }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xs tracking-wider shrink-0 border-2 border-[#17172b] shadow-[2px_2px_0px_#17172b]"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#77788b] uppercase tracking-wider block">
              {college.state}
            </span>
            <h3 className="font-extrabold text-[#17172b] text-base leading-tight group-hover:text-[#7456ff] transition-colors line-clamp-1">
              <Link to={`/college/${college.id}`}>{college.name}</Link>
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#77788b] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#7456ff]" />
              <span>{college.city}</span>
            </div>
          </div>
        </div>

        {/* Programme Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {college.programmes.map((p, idx) => (
            <span
              key={idx}
              className="text-[11px] font-bold bg-[#eeebff] text-[#7456ff] px-2.5 py-0.5 rounded-lg border border-[#7456ff]/20"
            >
              {p.type}
            </span>
          ))}
          <span className="text-[11px] font-bold bg-[#d9ff64] text-[#17172b] px-2.5 py-0.5 rounded-lg border border-[#17172b]/20">
            Min {college.minPercentile}%ile
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4] text-left">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#77788b] font-medium">
              <IndianRupee className="w-3 h-3 text-[#7456ff]" />
              <span>Total Fees</span>
            </div>
            <p className="font-extrabold text-sm text-[#17172b]">
              ₹{((college.programmes[0]?.totalFeeInr || 0) / 100000).toFixed(1)} Lakh
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#77788b] font-medium">
              <Briefcase className="w-3 h-3 text-emerald-600" />
              <span>Avg Package</span>
            </div>
            <p className="font-extrabold text-sm text-[#17172b]">₹{college.avgPackageLpa} LPA</p>
          </div>
        </div>

        {/* Exams Accepted */}
        <div className="mt-3 flex items-center justify-between text-xs text-[#77788b]">
          <span className="font-bold text-[11px] text-[#17172b]">Exams:</span>
          <div className="flex gap-1 flex-wrap justify-end">
            {college.examsAccepted.map((exam) => (
              <span
                key={exam}
                className="bg-white border border-[#e9e7f4] text-[#17172b] px-2 py-0.5 rounded-md text-[10px] font-bold"
              >
                {exam}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area with Deadline & Actions */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-t border-[#e9e7f4] flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#77788b] font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Deadline:</span>
          </div>
          <span
            className={`font-extrabold px-2 py-0.5 rounded-md text-[11px] ${
              isUrgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {daysLeft > 0 ? `${daysLeft} days left ⏳` : 'Passed'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleCompareToggle}
            className="flex items-center gap-1.5 text-xs font-bold text-[#17172b] hover:text-[#7456ff] transition-colors p-1"
          >
            {isCompared ? (
              <CheckSquare className="w-4 h-4 text-[#7456ff]" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
            <span>Compare</span>
          </button>

          <Link to={`/college/${college.id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="!py-2 !px-3.5 !text-xs font-extrabold border-[#17172b] hover:bg-[#d9ff64]"
            >
              Details →
            </Button>
          </Link>
        </div>

        {/* Demo Content Stamp */}
        <div className="flex justify-between items-center text-[10px] text-[#77788b]/70 border-t border-[#e9e7f4]/60 pt-1.5">
          <span>Demo content</span>
          <span>Last verified: demo</span>
        </div>
      </div>
    </div>
  );
};
