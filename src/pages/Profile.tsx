import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useApplicationStore } from '../store/applicationStore';
import { StorageService } from '../services/storage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { profile, updateProfile, resetApplication } = useApplicationStore();
  const { showToast } = useToast();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [personalName, setPersonalName] = useState(profile.personal.fullName || user?.fullName || '');
  const [personalEmail, setPersonalEmail] = useState(profile.personal.email || user?.email || '');
  const [personalPhone, setPersonalPhone] = useState(profile.personal.phone || user?.phone || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile((p) => ({
      ...p,
      personal: {
        ...p.personal,
        fullName: personalName,
        email: personalEmail,
        phone: personalPhone,
      },
    }));
    showToast('Profile information saved and synchronized!', 'success');
  };

  const handleDownloadData = () => {
    const data = StorageService.exportUserData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ConfirmMyCollege_UserData_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Your complete data archive has been downloaded.', 'success');
  };

  const handleDeleteAllData = () => {
    StorageService.clearAllData();
    resetApplication();
    logout();
    showToast('All your stored platform data has been permanently cleared.', 'info');
    navigate('/');
  };

  return (
    <div className="max-w-[760px] mx-auto px-5 sm:px-7 py-8 text-left space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#7456ff] uppercase tracking-wider block">
          Account & Privacy
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b] tracking-tight">
          Student Profile & Data Rights
        </h1>
        <p className="text-xs sm:text-sm text-[#77788b] mt-1">
          Manage your personal details, exercise DPDP Act privacy rights, or export your full data archive.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-8 shadow-[0_8px_24px_rgba(33,25,76,0.04)] space-y-6">
        <h2 className="font-bold text-base text-[#17172b]">Edit Personal Credentials</h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Legal Name"
            required
            value={personalName}
            onChange={(e) => setPersonalName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
            />

            <Input
              label="Contact Phone"
              required
              value={personalPhone}
              onChange={(e) => setPersonalPhone(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" icon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Compliance & DPDP Act Data Rights */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-8 shadow-[0_8px_24px_rgba(33,25,76,0.04)] space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-base text-[#17172b]">
            Digital Personal Data Protection (DPDP Act 2023) Rights
          </h2>
        </div>

        <div className="space-y-4 text-xs text-[#77788b] leading-relaxed">
          <p>
            As a student applicant, you maintain absolute ownership of your educational and personal
            records. You can download an offline portable copy of all stored information or erase your
            entire footprint at any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Download Data */}
            <div className="p-4 rounded-2xl bg-[#f8f7ff] border border-[#e9e7f4] flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#17172b]">Right to Data Portability</h4>
                <p className="text-[11px] text-[#77788b] mt-1">
                  Export all your application choices, academic records, and test scores in machine-readable JSON.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4 text-[#7456ff]" />}
                onClick={handleDownloadData}
              >
                Download My Data (JSON)
              </Button>
            </div>

            {/* Delete Data */}
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-red-900">Right to Erasure (Forget Me)</h4>
                <p className="text-[11px] text-red-700/80 mt-1">
                  Irreversibly delete all drafts, uploaded documents, and progress records from this device.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="!text-[#e5484d] hover:!bg-red-50 !border-red-200"
                icon={<Trash2 className="w-4 h-4 text-[#e5484d]" />}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                Delete My Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Permanent Data Deletion */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs"
            onClick={() => setConfirmDeleteOpen(false)}
          />
          <div className="relative bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl z-10 space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#e5484d] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#17172b]">Permanently Delete All Data?</h3>
            <p className="text-xs text-[#77788b] leading-relaxed">
              This action will erase your application drafts, question bank bookmarks, mock test records,
              and authenticated session from your device. This cannot be undone.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-[#e5484d] hover:!bg-red-700"
                onClick={handleDeleteAllData}
              >
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
