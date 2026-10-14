import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  X,
  ArrowRight,
  IndianRupee,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { useShortlistStore } from '../store/shortlistStore';
import { useApplicationStore } from '../store/applicationStore';
import { COLLEGES_DATA } from '../data/colleges';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { SoundFX } from '../utils/sound';

export const Compare: React.FC = () => {
  const { compareList, addCompare, removeCompare, clearCompare } = useShortlistStore();
  const { addChoice, setStep } = useApplicationStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchPickerOpen, setSearchPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const selectedColleges = COLLEGES_DATA.filter((c) => compareList.includes(c.id));

  // Determine best values for numeric rows
  const lowestFee = selectedColleges.length > 0
    ? Math.min(...selectedColleges.map((c) => c.programmes[0]?.totalFeeInr || Infinity))
    : 0;

  const highestAvgPackage = selectedColleges.length > 0
    ? Math.max(...selectedColleges.map((c) => c.avgPackageLpa))
    : 0;

  const highestMaxPackage = selectedColleges.length > 0
    ? Math.max(...selectedColleges.map((c) => c.highestPackageLpa))
    : 0;

  const handleAddFromPicker = (collegeId: string) => {
    const res = addCompare(collegeId);
    if (!res.success) {
      showToast(res.message || 'Cannot add more than 5 colleges to compare.', 'warning');
    } else {
      showToast('College added to comparison!', 'success');
      setSearchPickerOpen(false);
      setPickerSearch('');
    }
  };

  const handleApplyToSelected = () => {
    if (selectedColleges.length === 0) return;
    let added = 0;
    selectedColleges.slice(0, 5).forEach((col) => {
      const res = addChoice(col.id, col.programmes[0]?.type || 'PGDM');
      if (res.success) added++;
    });
    setStep(7);
    showToast(`Added ${added} colleges to your Common Application form!`, 'success');
    navigate('/apply');
  };

  const availableToAdd = COLLEGES_DATA.filter(
    (c) =>
      !compareList.includes(c.id) &&
      (c.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        c.city.toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7456ff] bg-[#eeebff] px-3 py-1 rounded-full mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Evaluation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#17172b] tracking-tight">
            Compare <span className="hero-highlight">B-Schools</span>
          </h1>
          <p className="text-sm text-[#77788b] mt-1">
            Compare up to 5 business schools simultaneously. The best values are highlighted in lime.
          </p>
        </div>

        {selectedColleges.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-xs font-semibold text-gray-500 hover:text-red-500 px-3 py-2"
            >
              Clear All ({selectedColleges.length})
            </button>
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleApplyToSelected}
            >
              Apply to These Colleges
            </Button>
          </div>
        )}
      </div>

      {/* College Slot Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[0, 1, 2, 3, 4].map((slotIndex) => {
          const col = selectedColleges[slotIndex];
          if (col) {
            return (
              <div
                key={col.id}
                className="bg-white p-3.5 rounded-2xl border border-[#7456ff]/30 shadow-xs relative flex flex-col justify-between"
              >
                <button
                  onClick={() => removeCompare(col.id)}
                  aria-label={`Remove ${col.shortName}`}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="pr-5">
                  <span className="text-[10px] font-bold text-[#7456ff] uppercase">Slot {slotIndex + 1}</span>
                  <h3 className="font-bold text-xs text-[#17172b] line-clamp-1 mt-0.5">{col.shortName}</h3>
                  <span className="text-[11px] text-[#77788b]">{col.city}</span>
                </div>
              </div>
            );
          }
          return (
            <button
              key={slotIndex}
              onClick={() => setSearchPickerOpen(true)}
              className="h-20 bg-white/70 hover:bg-[#eeebff]/40 border-2 border-dashed border-[#e9e7f4] hover:border-[#7456ff] rounded-2xl flex flex-col items-center justify-center gap-1 text-[#77788b] hover:text-[#7456ff] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold">+ Add College</span>
            </button>
          );
        })}
      </div>

      {/* Comparison Table View */}
      {selectedColleges.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#e9e7f4] p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#eeebff] text-[#7456ff] flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#17172b] mb-2">No Colleges in Comparison</h2>
          <p className="text-xs sm:text-sm text-[#77788b] mb-6 leading-relaxed">
            Select up to 5 business schools from the Explore directory or click below to search and add
            them side-by-side.
          </p>
          <Button variant="primary" onClick={() => setSearchPickerOpen(true)}>
            Choose First College
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Swipe Hint */}
          <div className="flex sm:hidden items-center justify-between px-3 py-2 bg-[#d9ff64] text-[#17172b] rounded-xl text-xs font-black border border-[#17172b] pop-shadow-sm">
            <span>👉 Swipe sideways to view all {selectedColleges.length} colleges</span>
            <span className="text-[10px] bg-[#17172b] text-white px-2 py-0.5 rounded-md">
              Horizontal Scroll
            </span>
          </div>

          <div className="bg-white rounded-[24px] border border-[#e9e7f4] shadow-[0_8px_24px_rgba(33,25,76,0.04)] overflow-hidden">
            <div className="overflow-x-auto snap-x snap-mandatory">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#e9e7f4] bg-[#f8f7ff]">
                  <th className="p-4 font-bold text-[#17172b] sticky left-0 bg-[#f8f7ff] z-10 w-44 min-w-[150px] shadow-xs">
                    Parameters
                  </th>
                  {selectedColleges.map((c) => (
                    <th key={c.id} className="p-4 font-bold text-[#17172b] min-w-[200px] align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/college/${c.id}`} className="hover:text-[#7456ff] transition-colors">
                            <span className="text-sm font-bold text-[#17172b] block">{c.name}</span>
                          </Link>
                          <span className="text-xs font-semibold text-[#77788b] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#7456ff]" />
                            {c.city}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCompare(c.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e7f4]">
                {/* Row 1: Programme */}
                <tr>
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-white z-10 shadow-xs">
                    Programme
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4">
                      <span className="font-semibold text-[#17172b]">{c.programmes[0]?.name}</span>
                      <Badge variant="purple" size="sm" className="block w-fit mt-1">
                        {c.programmes[0]?.type}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Row 2: Duration */}
                <tr className="bg-gray-50/40">
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-gray-50 z-10 shadow-xs">
                    Duration
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4 font-medium text-[#17172b]">
                      {c.programmes[0]?.durationYears} Years
                    </td>
                  ))}
                </tr>

                {/* Row 3: Total Fee (Best highlighted) */}
                <tr>
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-white z-10 shadow-xs">
                    Total Fee
                  </td>
                  {selectedColleges.map((c) => {
                    const fee = c.programmes[0]?.totalFeeInr || 0;
                    const isBest = fee === lowestFee && selectedColleges.length > 1;
                    return (
                      <td
                        key={c.id}
                        className={`p-4 transition-colors ${
                          isBest ? 'bg-[#d9ff64]/30 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#17172b]">
                            ₹{(fee / 100000).toFixed(1)} Lakh
                          </span>
                          {isBest && (
                            <span className="text-[10px] bg-[#d9ff64] text-[#17172b] px-1.5 py-0.5 rounded font-extrabold">
                              Best Fee
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 4: Seats */}
                <tr className="bg-gray-50/40">
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-gray-50 z-10 shadow-xs">
                    Sanctioned Seats
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4 font-medium text-[#17172b]">
                      {c.programmes[0]?.seats} seats
                    </td>
                  ))}
                </tr>

                {/* Row 5: Exams Accepted */}
                <tr>
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-white z-10 shadow-xs">
                    Exams Accepted
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {c.examsAccepted.map((ex) => (
                          <span
                            key={ex}
                            className="text-[11px] font-semibold bg-[#eeebff] text-[#7456ff] px-2 py-0.5 rounded-md"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 6: Min Percentile Cutoff */}
                <tr className="bg-gray-50/40">
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-gray-50 z-10 shadow-xs">
                    Min Percentile
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4 font-bold text-[#17172b]">
                      {c.minPercentile}%ile Cutoff
                    </td>
                  ))}
                </tr>

                {/* Row 7: Avg Package (Best highlighted) */}
                <tr>
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-white z-10 shadow-xs">
                    Avg Package
                  </td>
                  {selectedColleges.map((c) => {
                    const isBest = c.avgPackageLpa === highestAvgPackage && selectedColleges.length > 1;
                    return (
                      <td
                        key={c.id}
                        className={`p-4 transition-colors ${
                          isBest ? 'bg-[#d9ff64]/30 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700">₹{c.avgPackageLpa} LPA</span>
                          {isBest && (
                            <span className="text-[10px] bg-[#d9ff64] text-[#17172b] px-1.5 py-0.5 rounded font-extrabold">
                              Best Avg
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 8: Highest Package (Best highlighted) */}
                <tr className="bg-gray-50/40">
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-gray-50 z-10 shadow-xs">
                    Highest CTC
                  </td>
                  {selectedColleges.map((c) => {
                    const isBest = c.highestPackageLpa === highestMaxPackage && selectedColleges.length > 1;
                    return (
                      <td
                        key={c.id}
                        className={`p-4 transition-colors ${
                          isBest ? 'bg-[#d9ff64]/30 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#7456ff]">₹{c.highestPackageLpa} LPA</span>
                          {isBest && (
                            <span className="text-[10px] bg-[#d9ff64] text-[#17172b] px-1.5 py-0.5 rounded font-extrabold">
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 9: Hostel */}
                <tr>
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-white z-10 shadow-xs">
                    Hostel Facilities
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4 font-medium text-[#17172b]">
                      {c.hostel ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-4 h-4" /> On-Campus
                        </span>
                      ) : (
                        <span className="text-gray-500">Off-Campus Partnered</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Row 10: Deadline */}
                <tr className="bg-gray-50/40">
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-gray-50 z-10 shadow-xs">
                    Application Deadline
                  </td>
                  {selectedColleges.map((c) => {
                    const days = Math.ceil(
                      (new Date(c.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <td key={c.id} className="p-4 text-xs font-semibold text-[#17172b]">
                        <span className="block">
                          {new Date(c.applicationDeadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-[#77788b]">{days} days remaining</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 11: City & State */}
                <tr>
                  <td className="p-4 font-bold text-[#17172b] sticky left-0 bg-white z-10 shadow-xs">
                    Campus Location
                  </td>
                  {selectedColleges.map((c) => (
                    <td key={c.id} className="p-4 font-medium text-[#17172b]">
                      {c.city}, {c.state}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Table Action Strip */}
          <div className="p-6 bg-[#f8f7ff] border-t border-[#e9e7f4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#77788b]">
              Demo content · Ready to apply with ONE common form and fee?
            </span>
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleApplyToSelected}
            >
              Apply to These ({selectedColleges.length}) Colleges
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Add College Modal Picker */}
      {searchPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs"
            onClick={() => setSearchPickerOpen(false)}
          />
          <div className="relative bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl z-10 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#e9e7f4]">
              <h3 className="font-bold text-lg text-[#17172b]">Add College to Compare</h3>
              <button
                onClick={() => setSearchPickerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4">
              <input
                type="text"
                placeholder="Search college name or city..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#e9e7f4] text-xs outline-none focus:border-[#7456ff]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableToAdd.length === 0 ? (
                <p className="text-xs text-[#77788b] text-center py-6">
                  No additional colleges found.
                </p>
              ) : (
                availableToAdd.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => handleAddFromPicker(col.id)}
                    className="p-3 rounded-xl border border-[#e9e7f4] hover:border-[#7456ff] hover:bg-[#eeebff]/30 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#17172b]">{col.name}</h4>
                      <p className="text-[11px] text-[#77788b]">{col.city} · Min {col.minPercentile}%ile</p>
                    </div>
                    <Button variant="ghost" size="sm" className="!p-1.5">
                      <Plus className="w-4 h-4 text-[#7456ff]" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
