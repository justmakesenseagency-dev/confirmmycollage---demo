import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#e9e7f4] mt-20 pt-16 pb-24 lg:pb-16 text-left">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-7">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#e9e7f4]">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] bg-[#7456ff] rounded-[8px] -rotate-6 flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-lg">C</span>
              </div>
              <span className="font-extrabold text-xl text-[#17172b]">
                ConfirmMy<span className="text-[#7456ff]">College</span>
              </span>
            </Link>
            <p className="text-sm text-[#77788b] leading-relaxed max-w-sm">
              India’s unified common application platform for prospective MBA and PGDM students.
              Explore accredited programmes, compare curriculum metrics, and apply to 5 B-schools with
              a single form and one application fee.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/50 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Aligned with DPDP Act 2023 Principles</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#17172b] uppercase tracking-wider">Product</h4>
            <Link to="/explore" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Explore B-Schools
            </Link>
            <Link to="/compare" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Compare 5 Colleges
            </Link>
            <Link to="/apply" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Common Application Form
            </Link>
            <Link to="/quiz" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors flex items-center gap-1">
              <span>College Finder Quiz</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#7456ff]" />
            </Link>
            <Link to="/dashboard" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Application Tracker
            </Link>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#17172b] uppercase tracking-wider">Resources</h4>
            <Link to="/questions" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Question Corner
            </Link>
            <Link to="/mock-test" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              CAT / MBA Mock Test
            </Link>
            <Link to="/scholarships" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Scholarships & Grants
            </Link>
            <a
              href="#/questions?section=Interview"
              className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors"
            >
              Interview & WAT Corner
            </a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#17172b] uppercase tracking-wider">Legal & Trust</h4>
            <Link to="/privacy" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Privacy Policy (DPDP 2023)
            </Link>
            <Link to="/terms" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Terms of Service
            </Link>
            <Link to="/refund" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Refund Policy
            </Link>
            <Link to="/profile" className="text-sm text-[#77788b] hover:text-[#7456ff] transition-colors">
              Manage / Delete My Data
            </Link>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#77788b]">
          <p className="max-w-2xl leading-relaxed">
            <strong className="text-[#17172b]">Disclaimer:</strong> ConfirmMyCollege is a prototype
            demonstration. <strong>No guarantee of admission.</strong> All listed institutions, cutoffs,
            and fees are illustrative demo data. Rankings, placements, and partnerships appear only once
            verified.
          </p>
          <p className="shrink-0 font-medium">© {new Date().getFullYear()} ConfirmMyCollege. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
