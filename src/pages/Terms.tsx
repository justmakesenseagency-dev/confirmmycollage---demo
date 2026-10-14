import React from 'react';
import { Badge } from '../components/ui/Badge';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-7 py-8 text-left space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="purple" size="sm">
          Platform Agreement
        </Badge>
        <span className="text-xs text-[#77788b]">Draft, to be reviewed by a lawyer</span>
      </div>

      <h1 className="text-3xl font-bold text-[#17172b]">Terms of Service</h1>
      <p className="text-xs text-[#77788b]">Last Updated: October 2026</p>

      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-8 shadow-xs space-y-6 text-sm text-[#17172b] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">1. Acceptance of Terms</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            By accessing ConfirmMyCollege and submitting common application information, you consent to
            be bound by these terms. This web application is a demonstration prototype for common MBA
            application workflows.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">2. No Guarantee of Admission</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            ConfirmMyCollege functions solely as an administrative aggregator. Selection, shortlisting,
            interview scheduling, and final admissions decisions rest exclusively with the autonomous
            faculties and admissions committees of participating business schools.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">3. Accurate Representations</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            Applicants warrant that all uploaded transcripts, scores, and personal credentials are true
            and accurate. Submission of fabricated documents constitutes grounds for immediate cancellation
            of applications.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">4. Intellectual Property</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            Mock test formulations, design system assets, algorithmic models, and Question Corner contents
            are proprietary to ConfirmMyCollege.
          </p>
        </section>
      </div>
    </div>
  );
};
