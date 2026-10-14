import React from 'react';
import { Badge } from '../components/ui/Badge';

export const Refund: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-7 py-8 text-left space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="purple" size="sm">
          Fee Policies
        </Badge>
        <span className="text-xs text-[#77788b]">Draft, to be reviewed by a lawyer</span>
      </div>

      <h1 className="text-3xl font-bold text-[#17172b]">Refund & Cancellation Policy</h1>
      <p className="text-xs text-[#77788b]">Last Updated: October 2026</p>

      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-8 shadow-xs space-y-6 text-sm text-[#17172b] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">1. Application Package Fees</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            The ConfirmMyCollege common application processing fee (₹1,500 demo package) covers administrative
            data transmission and document verification across up to 5 chosen institutions. Once an application
            is transmitted and submitted, the application processing fee is non-refundable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">2. College Tuition Seat Cancellations</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            Seat booking deposits and academic tuition fees paid directly to colleges adhere strictly to
            statutory AICTE/UGC guidelines. If an applicant withdraws prior to commencement of orientation,
            the tuition is refunded with deduction of not more than ₹1,000 as processing fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-[#17172b]">3. Double Charges & Technical Glitches</h2>
          <p className="text-xs sm:text-sm text-[#77788b]">
            In the event of an inadvertent double-debit due to network timeout during checkout, the redundant
            transaction will be automatically reversed to the originating bank account within 3-5 business days.
          </p>
        </section>
      </div>
    </div>
  );
};
