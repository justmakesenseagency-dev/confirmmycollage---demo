import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  IndianRupee,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { COLLEGES_DATA } from '../data/colleges';
import { CollegeCard } from '../components/cards/CollegeCard';
import { CollegeCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useShortlistStore } from '../store/shortlistStore';
import { ExamName, ProgrammeType } from '../types';
import { SoundFX } from '../utils/sound';

const ALL_CITIES = Array.from(new Set(COLLEGES_DATA.map((c) => c.city)));
const ALL_EXAMS: ExamName[] = ['CAT', 'XAT', 'SNAP', 'NMAT', 'CMAT', 'GMAT', 'MAT'];
const ALL_PROGRAMMES: ProgrammeType[] = ['MBA', 'PGDM', 'Executive MBA', 'Online MBA'];

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { compareList, clearCompare } = useShortlistStore();

  const [isLoading, setIsLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL query params
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'fee-asc';
  const selectedCities = searchParams.getAll('city');
  const selectedExams = searchParams.getAll('exam') as ExamName[];
  const selectedProgramme = searchParams.get('programme') || 'All';
  const maxFeeLakh = searchParams.get('maxFee') ? parseInt(searchParams.get('maxFee')!, 10) : 25;
  const maxPercentile = searchParams.get('maxPercentile') ? parseInt(searchParams.get('maxPercentile')!, 10) : 95;
  const hostelOnly = searchParams.get('hostel') === 'true';

  // Helper to update search params
  const updateParam = (key: string, value: string | string[] | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.delete(key);
      value.forEach((v) => next.append(key, v));
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Brief mock loading feel on filter update
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const filteredColleges = useMemo(() => {
    return COLLEGES_DATA.filter((col) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = col.name.toLowerCase().includes(query);
        const matchesCity = col.city.toLowerCase().includes(query);
        const matchesTags = col.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesCity && !matchesTags) return false;
      }

      // City filter
      if (selectedCities.length > 0 && !selectedCities.includes(col.city)) {
        return false;
      }

      // Programme filter
      if (selectedProgramme !== 'All') {
        if (!col.programmes.some((p) => p.type === selectedProgramme)) {
          return false;
        }
      }

      // Fee filter (in Lakh)
      const lowestFeeLakh = (col.programmes[0]?.totalFeeInr || 0) / 100000;
      if (lowestFeeLakh > maxFeeLakh) return false;

      // Percentile
      if (col.minPercentile > maxPercentile) return false;

      // Exams
      if (selectedExams.length > 0) {
        const hasExam = selectedExams.some((ex) => col.examsAccepted.includes(ex));
        if (!hasExam) return false;
      }

      // Hostel
      if (hostelOnly && !col.hostel) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'fee-asc') {
        return (a.programmes[0]?.totalFeeInr || 0) - (b.programmes[0]?.totalFeeInr || 0);
      }
      if (sortBy === 'fee-desc') {
        return (b.programmes[0]?.totalFeeInr || 0) - (a.programmes[0]?.totalFeeInr || 0);
      }
      if (sortBy === 'package-desc') {
        return b.avgPackageLpa - a.avgPackageLpa;
      }
      if (sortBy === 'deadline-asc') {
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      }
      return 0;
    });
  }, [
    searchQuery,
    selectedCities,
    selectedProgramme,
    maxFeeLakh,
    maxPercentile,
    selectedExams,
    hostelOnly,
    sortBy,
  ]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCities.length +
    (selectedProgramme !== 'All' ? 1 : 0) +
    selectedExams.length +
    (maxFeeLakh < 25 ? 1 : 0) +
    (maxPercentile < 95 ? 1 : 0) +
    (hostelOnly ? 1 : 0);

  const FilterPanel = () => (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e9e7f4]">
        <h3 className="font-bold text-base text-[#17172b]">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-[#7456ff] hover:underline"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Programme Type */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#77788b] block mb-2">
          Programme Type
        </label>
        <select
          value={selectedProgramme}
          onChange={(e) => updateParam('programme', e.target.value === 'All' ? null : e.target.value)}
          className="w-full h-11 px-3 rounded-xl border border-[#e9e7f4] text-xs font-medium bg-white text-[#17172b] outline-none focus:border-[#7456ff]"
        >
          <option value="All">All Programmes</option>
          {ALL_PROGRAMMES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Cities (Multi) */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#77788b] block mb-2">
          Cities
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {ALL_CITIES.map((city) => {
            const checked = selectedCities.includes(city);
            return (
              <label
                key={city}
                className="flex items-center gap-2 text-xs font-medium text-[#17172b] cursor-pointer hover:text-[#7456ff]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const nextCities = e.target.checked
                      ? [...selectedCities, city]
                      : selectedCities.filter((c) => c !== city);
                    updateParam('city', nextCities);
                  }}
                  className="rounded border-[#e9e7f4] text-[#7456ff] focus:ring-[#7456ff]"
                />
                <span>{city}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Max Fee Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#77788b]">
            Max Fee (₹ Lakh)
          </label>
          <span className="text-xs font-bold text-[#7456ff]">₹{maxFeeLakh} Lakh</span>
        </div>
        <input
          type="range"
          min="5"
          max="25"
          step="1"
          value={maxFeeLakh}
          onChange={(e) => updateParam('maxFee', e.target.value)}
          className="w-full accent-[#7456ff] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#77788b] mt-1">
          <span>₹5L</span>
          <span>₹15L</span>
          <span>₹25L</span>
        </div>
      </div>

      {/* Cutoff Percentile Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#77788b]">
            Min Percentile Cutoff
          </label>
          <span className="text-xs font-bold text-[#7456ff]">≤ {maxPercentile}%ile</span>
        </div>
        <input
          type="range"
          min="70"
          max="95"
          step="1"
          value={maxPercentile}
          onChange={(e) => updateParam('maxPercentile', e.target.value)}
          className="w-full accent-[#7456ff] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#77788b] mt-1">
          <span>70%</span>
          <span>80%</span>
          <span>95%</span>
        </div>
      </div>

      {/* Exams Accepted */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#77788b] block mb-2">
          Exams Accepted
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_EXAMS.map((exam) => {
            const checked = selectedExams.includes(exam);
            return (
              <button
                key={exam}
                onClick={() => {
                  const nextExams = checked
                    ? selectedExams.filter((ex) => ex !== exam)
                    : [...selectedExams, exam];
                  updateParam('exam', nextExams);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  checked
                    ? 'bg-[#7456ff] text-white border-[#7456ff]'
                    : 'bg-white text-[#77788b] border-[#e9e7f4] hover:border-[#7456ff]'
                }`}
              >
                {exam}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hostel Accommodations Toggle */}
      <div className="pt-2 border-t border-[#e9e7f4]">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-[#17172b]">Campus Hostel Available</span>
          <input
            type="checkbox"
            checked={hostelOnly}
            onChange={(e) => updateParam('hostel', e.target.checked ? 'true' : null)}
            className="w-4 h-4 text-[#7456ff] rounded focus:ring-[#7456ff]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-7 py-6 sm:py-8 text-left">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#17172b] bg-[#d9ff64] px-3 py-1 rounded-full border border-[#17172b] mb-1.5 pop-shadow-sm">
            <span>Verified 2026-28 Cohorts 🔥</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#17172b] tracking-tight">
            Explore <span className="hero-highlight">B-Schools</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77788b] mt-1 font-medium">
            Compare top management institutions across India and select up to 5 for your common application.
          </p>
        </div>

        {/* Search bar & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search college, city, tag..."
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e9e7f4] bg-white text-xs text-[#17172b] outline-none focus:border-[#7456ff] focus:ring-2 focus:ring-[#7456ff]/20"
            />
            {searchQuery && (
              <button
                onClick={() => updateParam('q', null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-[#e9e7f4] bg-white text-xs font-semibold text-[#17172b] outline-none cursor-pointer focus:border-[#7456ff]"
          >
            <option value="fee-asc">Fee: Low to High</option>
            <option value="fee-desc">Fee: High to Low</option>
            <option value="package-desc">Package: High to Low</option>
            <option value="deadline-asc">Deadline: Soonest</option>
          </select>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => {
              SoundFX.pop();
              setMobileFilterOpen(true);
            }}
            className="lg:hidden h-11 px-3.5 rounded-xl border border-[#e9e7f4] bg-white text-xs font-bold text-[#17172b] flex items-center gap-2 hover:bg-[#eeebff] cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#7456ff]" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>
        </div>
      </div>

      {/* Gen Z Rapid 1-Tap Filter Tags (Mobile-first friendly) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 -mt-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#77788b] shrink-0">
          Quick Vibes:
        </span>
        <button
          onClick={() => {
            SoundFX.pop();
            updateParam('sort', sortBy === 'package-desc' ? null : 'package-desc');
          }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all border cursor-pointer ${
            sortBy === 'package-desc'
              ? 'bg-[#17172b] text-[#d9ff64] border-[#17172b] pop-shadow-sm'
              : 'bg-white text-[#17172b] border-[#e9e7f4] hover:border-[#17172b]'
          }`}
        >
          🔥 Top CTC (High Pay)
        </button>
        <button
          onClick={() => {
            SoundFX.pop();
            updateParam('maxFee', maxFeeLakh === 15 ? null : '15');
          }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all border cursor-pointer ${
            maxFeeLakh === 15
              ? 'bg-[#17172b] text-[#d9ff64] border-[#17172b] pop-shadow-sm'
              : 'bg-white text-[#17172b] border-[#e9e7f4] hover:border-[#17172b]'
          }`}
        >
          ⚡ Under ₹15L Fee
        </button>
        <button
          onClick={() => {
            SoundFX.pop();
            const hasMetro = selectedCities.includes('Mumbai') || selectedCities.includes('Bengaluru');
            if (hasMetro) {
              updateParam('city', selectedCities.filter((c) => c !== 'Mumbai' && c !== 'Bengaluru'));
            } else {
              updateParam('city', Array.from(new Set([...selectedCities, 'Mumbai', 'Bengaluru'])));
            }
          }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all border cursor-pointer ${
            selectedCities.includes('Mumbai') && selectedCities.includes('Bengaluru')
              ? 'bg-[#17172b] text-[#d9ff64] border-[#17172b] pop-shadow-sm'
              : 'bg-white text-[#17172b] border-[#e9e7f4] hover:border-[#17172b]'
          }`}
        >
          🌆 Mumbai & Bengaluru
        </button>
        <button
          onClick={() => {
            SoundFX.pop();
            updateParam('hostel', hostelOnly ? null : 'true');
          }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all border cursor-pointer ${
            hostelOnly
              ? 'bg-[#17172b] text-[#d9ff64] border-[#17172b] pop-shadow-sm'
              : 'bg-white text-[#17172b] border-[#e9e7f4] hover:border-[#17172b]'
          }`}
        >
          🏠 Hostels Included
        </button>
        <button
          onClick={() => {
            SoundFX.pop();
            updateParam('q', searchQuery === 'Founder' ? null : 'Founder');
          }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-all border cursor-pointer ${
            searchQuery === 'Founder'
              ? 'bg-[#17172b] text-[#d9ff64] border-[#17172b] pop-shadow-sm'
              : 'bg-white text-[#17172b] border-[#e9e7f4] hover:border-[#17172b]'
          }`}
        >
          🚀 Founder Hub
        </button>
      </div>

      {/* Active filter chips & result count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e9e7f4]/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#17172b]">
            Showing {filteredColleges.length} {filteredColleges.length === 1 ? 'College' : 'Colleges'}
          </span>

          {selectedCities.map((city) => (
            <Badge key={city} variant="purple" size="sm" className="gap-1">
              <span>{city}</span>
              <button
                onClick={() => updateParam('city', selectedCities.filter((c) => c !== city))}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {selectedProgramme !== 'All' && (
            <Badge variant="purple" size="sm" className="gap-1">
              <span>{selectedProgramme}</span>
              <button onClick={() => updateParam('programme', null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedExams.map((exam) => (
            <Badge key={exam} variant="purple" size="sm" className="gap-1">
              <span>{exam}</span>
              <button
                onClick={() => updateParam('exam', selectedExams.filter((e) => e !== exam))}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#e5484d] font-semibold hover:underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block bg-white p-6 rounded-[24px] border border-[#e9e7f4] shadow-[0_8px_24px_rgba(33,25,76,0.04)] sticky top-24">
          <FilterPanel />
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CollegeCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredColleges.length === 0 ? (
            <EmptyState
              title="No colleges match your filter criteria"
              description="Try adjusting your fee limits, percentile cutoff, or selected cities to discover more business schools."
              actionText="Reset All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Bottom-Sheet Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-white rounded-t-[28px] p-6 max-h-[85vh] overflow-y-auto shadow-2xl z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#17172b]">Filter B-Schools</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
            <div className="mt-6 pt-4 border-t border-[#e9e7f4] flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filteredColleges.length} Colleges
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Bar (Appears when 2+ colleges selected) */}
      {compareList.length >= 2 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#17172b] text-white px-4 sm:px-5 py-3 rounded-2xl border-2 border-white pop-shadow flex items-center justify-between gap-3 w-[calc(100vw-32px)] sm:w-auto max-w-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d9ff64] animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold truncate">
              {compareList.length}/5 Selected
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearCompare}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 font-semibold"
            >
              Clear
            </button>
            <Button
              variant="primary"
              size="sm"
              className="!bg-[#d9ff64] !text-[#17172b] hover:!bg-white border border-[#17172b] font-black !text-xs !py-2"
              onClick={() => navigate('/compare')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Compare ({compareList.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
