import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, Heart, Layers } from 'lucide-react';
import { useShortlistStore } from '../../store/shortlistStore';
import { useApplicationStore } from '../../store/applicationStore';
import { COLLEGES_DATA } from '../../data/colleges';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ShortlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortlistDrawer: React.FC<ShortlistDrawerProps> = ({ isOpen, onClose }) => {
  const { shortlist, toggleShortlist, addCompare } = useShortlistStore();
  const { addChoice, setStep } = useApplicationStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const shortlistedColleges = COLLEGES_DATA.filter((c) => shortlist.includes(c.id));

  const handleApplyAll = () => {
    let addedCount = 0;
    shortlistedColleges.slice(0, 5).forEach((col) => {
      const res = addChoice(col.id, col.programmes[0]?.type || 'PGDM');
      if (res.success) addedCount++;
    });
    setStep(7);
    onClose();
    showToast(`Added ${addedCount} colleges to your Common Application form!`, 'success');
    navigate('/apply');
  };

  const handleCompareAll = () => {
    shortlistedColleges.slice(0, 5).forEach((col) => {
      addCompare(col.id);
    });
    onClose();
    navigate('/compare');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#17172b]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col border-l border-[#e9e7f4] animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-[#e9e7f4] flex items-center justify-between bg-[#f8f7ff]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#eeebff] text-[#7456ff] rounded-xl">
              <Heart className="w-5 h-5 fill-[#7456ff]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#17172b]">My Shortlist</h3>
              <p className="text-xs text-[#77788b]">
                {shortlistedColleges.length} {shortlistedColleges.length === 1 ? 'college' : 'colleges'} saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortlist"
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {shortlistedColleges.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-[#eeebff] flex items-center justify-center text-[#7456ff] mb-3">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-[#17172b] mb-1">Your shortlist is empty</h4>
              <p className="text-xs text-[#77788b] max-w-xs mb-4">
                Explore colleges and tap the heart icon on any B-school card to bookmark it here.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/explore');
                }}
              >
                Browse Colleges
              </Button>
            </div>
          ) : (
            shortlistedColleges.map((col) => (
              <div
                key={col.id}
                className="p-4 rounded-2xl border border-[#e9e7f4] bg-white hover:border-[#7456ff]/40 transition-all flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#17172b] truncate">{col.name}</h4>
                  <p className="text-xs text-[#77788b] mt-0.5">{col.city}, {col.state}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="purple" size="sm">
                      ₹{((col.programmes[0]?.totalFeeInr || 0) / 100000).toFixed(1)}L Fee
                    </Badge>
                    <Badge variant="lime" size="sm">
                      {col.avgPackageLpa} LPA Avg
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => toggleShortlist(col.id)}
                  aria-label={`Remove ${col.name} from shortlist`}
                  className="p-2 text-gray-400 hover:text-[#e5484d] hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {shortlistedColleges.length > 0 && (
          <div className="p-5 border-t border-[#e9e7f4] bg-[#f8f7ff] flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleApplyAll}
            >
              Apply to These Colleges (Max 5)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Layers className="w-4 h-4" />}
              onClick={handleCompareAll}
            >
              Compare Side-by-Side
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
