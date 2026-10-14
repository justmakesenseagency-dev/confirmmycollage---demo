import React, { useState, useMemo } from 'react';
import {
  Award,
  Filter,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

export const Scholarships: React.FC = () => {
  const { showToast } = useToast();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [myPercentile, setMyPercentile] = useState<number>(75);
  const [myFamilyIncomeLpa, setMyFamilyIncomeLpa] = useState<number>(10);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DATA.filter((sch) => {
      // Category tag filter
      if (selectedCategory !== 'All') {
        const matchesCat = sch.categoryTags.some(
          (t) => t.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!matchesCat) return false;
      }

      // Check eligibility mode
      if (filterActive) {
        if (myPercentile < sch.minPercentile) return false;
        if (myFamilyIncomeLpa > sch.maxFamilyIncomeLpa) return false;
      }

      return true;
    });
  }, [selectedCategory, filterActive, myPercentile, myFamilyIncomeLpa]);

  const handleApplyScholarship = (name: string) => {
    showToast(`Scholarship preference "${name}" linked to your Common Application profile!`, 'success');
  };

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7456ff] bg-[#eeebff] px-3 py-1 rounded-full mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Financial Support & Fellowships</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#17172b] tracking-tight">
          B-School <span className="hero-highlight">Scholarships</span> & Grants
        </h1>
        <p className="text-sm text-[#77788b] mt-1">
          Explore need-based and merit fellowships up to ₹6 Lakh for eligible PGDM/MBA candidates.
        </p>
      </div>

      {/* "Check My Eligibility" Interactive Form Banner */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-8 shadow-[0_8px_24px_rgba(33,25,76,0.04)] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7456ff]" />
          <h2 className="font-bold text-base text-[#17172b]">
            Interactive Eligibility Screener
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-[#77788b] uppercase block mb-1.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#e9e7f4] text-xs font-semibold bg-[#f8f7ff] text-[#17172b] outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Merit">Merit & Academic</option>
              <option value="Women in Business">Women in Business</option>
              <option value="SC">SC / ST</option>
              <option value="EWS">EWS</option>
              <option value="STEM">STEM / Analytics</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#77788b] uppercase">
                My Entrance Percentile
              </label>
              <span className="text-xs font-bold text-[#7456ff]">{myPercentile}%ile</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={myPercentile}
              onChange={(e) => setMyPercentile(parseInt(e.target.value, 10))}
              className="w-full accent-[#7456ff] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#77788b] uppercase">
                Annual Family Income (LPA)
              </label>
              <span className="text-xs font-bold text-[#7456ff]">≤ ₹{myFamilyIncomeLpa} LPA</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              value={myFamilyIncomeLpa}
              onChange={(e) => setMyFamilyIncomeLpa(parseInt(e.target.value, 10))}
              className="w-full accent-[#7456ff] cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#17172b]">
            <input
              type="checkbox"
              checked={filterActive}
              onChange={(e) => setFilterActive(e.target.checked)}
              className="w-4 h-4 text-[#7456ff] rounded"
            />
            <span>Filter strictly by my percentile and family income</span>
          </label>

          {filterActive && (
            <button
              onClick={() => {
                setFilterActive(false);
                setSelectedCategory('All');
              }}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Clear Screener
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-[#17172b]">
          Available Fellowships ({filteredScholarships.length} Grants Found)
        </h3>

        {filteredScholarships.length === 0 ? (
          <EmptyState
            title="No scholarships found matching this profile"
            description="Try increasing your annual income limit or adjusting the target percentile in the screener."
            actionText="Reset Screener"
            onAction={() => {
              setFilterActive(false);
              setSelectedCategory('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScholarships.map((sch) => {
              const isExpanded = expandedId === sch.id;
              return (
                <div
                  key={sch.id}
                  className="bg-white rounded-[24px] border border-[#e9e7f4] p-6 shadow-[0_8px_24px_rgba(33,25,76,0.04)] flex flex-col justify-between hover:border-[#7456ff]/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap gap-1">
                        {sch.categoryTags.map((tag) => (
                          <Badge key={tag} variant="purple" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-[#77788b] block">Grant Value</span>
                        <span className="text-lg font-bold text-[#7456ff]">
                          ₹{(sch.amountInr / 100000).toFixed(1)} Lakh
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#17172b] leading-tight">
                      {sch.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#77788b] mt-0.5">{sch.provider}</p>

                    <div className="p-3.5 bg-[#f8f7ff] rounded-xl border border-[#e9e7f4]/60 my-3 text-xs text-[#17172b] leading-relaxed">
                      <strong>Eligibility:</strong> {sch.eligibility}
                    </div>

                    {/* Collapsible How to Apply steps */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-[#e9e7f4] space-y-2 animate-in fade-in duration-200">
                        <span className="text-xs font-bold text-[#17172b] block">
                          Application & Disbursement Steps:
                        </span>
                        <ul className="text-xs text-[#77788b] space-y-1.5 list-disc list-inside">
                          {sch.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#e9e7f4] flex items-center justify-between gap-3 mt-4">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sch.id)}
                      className="text-xs font-bold text-[#7456ff] hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Steps' : 'How to Apply'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApplyScholarship(sch.name)}
                    >
                      Tag to Application
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
