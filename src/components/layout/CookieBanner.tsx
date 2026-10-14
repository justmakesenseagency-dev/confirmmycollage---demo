import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { StorageService } from '../../services/storage';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsented = StorageService.getConsent();
    if (!hasConsented) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    StorageService.setConsent(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and Data Consent"
      className="fixed bottom-16 lg:bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-md z-40 bg-white rounded-2xl border border-[#e9e7f4] shadow-2xl p-5 text-left animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#eeebff] text-[#7456ff] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-[#17172b]">Data Privacy Notice (DPDP Act)</h4>
          <p className="text-xs text-[#77788b] mt-1 leading-relaxed">
            ConfirmMyCollege stores your application draft and question progress locally on your
            device. We never sell your personal contact credentials to third-party telemarketers.
            Review our{' '}
            <Link to="/privacy" className="text-[#7456ff] underline font-semibold">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleAccept}>
              I Understand & Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVisible(false)}
              className="!text-xs text-gray-500"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
