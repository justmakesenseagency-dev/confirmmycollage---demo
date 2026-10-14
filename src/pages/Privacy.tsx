import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-7 py-8 text-left space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="purple" size="sm">
          Compliance & Transparency
        </Badge>
        <span className="text-xs text-[#77788b]">Draft, to be reviewed by a lawyer</span>
      </div>

      <h1 className="text-3xl font-bold text-[#17172b]">
        Privacy Policy & Data Protection (DPDP Act 2023)
      </h1>
      <p className="text-xs text-[#77788b]">Last Updated: October 2026 · Effective Immediately</p>

      <div className="bg-white rounded-[24px] border border-[#e9e7f4] p-6 sm:p-8 shadow-xs space-y-6 text-sm text-[#17172b] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">1. Purpose and Scope</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            ConfirmMyCollege operates as a centralized common application and discovery platform for
            postgraduate management candidates in India. This privacy charter details how your personal,
            academic, and test credentials are collected, processed, and safeguarded in strict alignment
            with India’s Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">2. What Data We Collect & Why</h2>
          <ul className="text-xs sm:text-sm text-[#77788b] space-y-2 list-disc list-inside">
            <li>
              <strong>Identity & Contact:</strong> Full name, date of birth, mobile number, email, and
              residential address required for verifiable college admission applications.
            </li>
            <li>
              <strong>Academic & Score Credentials:</strong> 10th, 12th, and graduation percentages alongside
              verified entrance test scorecards (CAT, XAT, SNAP, NMAT, CMAT).
            </li>
            <li>
              <strong>Professional Background:</strong> Employment tenure, role designations, and Statements
              of Purpose (SOP) shared with college evaluation committees.
            </li>
            <li>
              <strong>AI Feature Interactions:</strong> SOP drafts submitted for AI critique are processed
              temporarily and never retained to train public foundational models.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">3. No Sale of Student Data</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            ConfirmMyCollege strictly adheres to a zero-telemarketing policy. We never monetize, rent, or
            trade candidate mobile numbers or email databases to unauthorized commercial coaching centres or
            unaffiliated lenders.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">4. Data Retention & Right to Erasure</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            Under Section 12 of the DPDP Act 2023, you maintain the irrevocable Right to Correction and the
            Right to Erasure. You can delete your entire data profile and application records directly from
            the "Profile & Data Rights" portal or by triggering the "Delete My Data" action.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">5. Grievance Redressal</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            For privacy inquiries or compliance notices, reach our designated Data Protection Officer at:
            <br />
            <strong>grievance@confirmmycollege-demo.in</strong>
          </p>
        </section>
      </div>
    </div>
  );
};
