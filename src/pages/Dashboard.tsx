import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Download,
  ArrowRight,
  Building2,
  FileText,
  Bell,
  Sparkles,
  AlertCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { useApplicationStore, APPLICATION_FEE_INR } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';
import { COLLEGES_DATA } from '../data/colleges';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';

export const Dashboard: React.FC = () => {
  const { application, profile } = useApplicationStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isSubmitted = application.status === 'Submitted';

  // Completion calculation
  let completedFields = 0;
  const totalFields = 6;
  if (profile.personal.fullName && profile.personal.email) completedFields++;
  if (profile.academics.graduation.institution) completedFields++;
  if (profile.exams.length > 0) completedFields++;
  if (profile.sop && profile.sop.length > 100) completedFields++;
  if (application.choices.length > 0) completedFields++;
  if (isSubmitted) completedFields++;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Next deadline countdown
  let nextDeadlineCollege = COLLEGES_DATA[0];
  let minDaysLeft = Infinity;

  COLLEGES_DATA.forEach((col) => {
    const days = Math.ceil(
      (new Date(col.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days > 0 && days < minDaysLeft) {
      minDaysLeft = days;
      nextDeadlineCollege = col;
    }
  });

  const handleDownloadReceipt = () => {
    if (!application.payment) {
      showToast('No payment receipt available yet.', 'warning');
      return;
    }
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${application.payment.receiptNo}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #17172b; max-width: 650px; margin: auto; }
          .header { border-bottom: 2px solid #7456ff; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: bold; }
          .logo span { color: #7456ff; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ConfirmMy<span>College</span></div>
          <p>Receipt Number: <strong>${application.payment.receiptNo}</strong></p>
          <p>Paid At: ${new Date(application.payment.paidAt).toLocaleString()}</p>
        </div>
        <p><strong>Candidate:</strong> ${profile.personal.fullName || user?.fullName || 'Student'}</p>
        <p><strong>Amount Paid:</strong> ₹${APPLICATION_FEE_INR}.00 (Mock Payment)</p>
        <p><strong>Covered Institutions:</strong> ${application.choices.length} Colleges</p>
      </body>
      </html>
    `;
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${application.payment.receiptNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const demoNotifications = [
    {
      id: 'notif-1',
      title: 'Common Application status updated',
      time: '1 hour ago',
      desc: isSubmitted
        ? 'Your application package has been dispatched to all selected B-schools.'
        : 'You have a draft application in progress. Complete your submission before deadlines.',
    },
    {
      id: 'notif-2',
      title: 'Interview Preparation Tip',
      time: 'Yesterday',
      desc: 'Check the Question Corner for the top 5 WAT essay prompts frequently asked in PI rounds.',
    },
    {
      id: 'notif-3',
      title: 'Upcoming Entrance Exam',
      time: '3 days ago',
      desc: 'CAT / XAT admit cards are releasing shortly. Keep your application roll numbers updated.',
    },
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left space-y-8">
      {/* Top Banner & Greeting */}
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-8 shadow-[0_8px_24px_rgba(33,25,76,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#7456ff] uppercase tracking-wider block">
            Applicant Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17172b] mt-1">
            Welcome back, {profile.personal.fullName || user?.fullName || 'MBA Aspirant'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#77788b] mt-1">
            Track your common application progress, college admission review pipelines, and upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isSubmitted ? (
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownloadReceipt}
            >
              Download Receipt
            </Button>
          ) : (
            <Link to="/apply">
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Continue Application
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Progress Ring & Next Deadline Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="bg-white p-6 rounded-[24px] border border-[#e9e7f4] shadow-xs flex items-center gap-5">
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#eeebff]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#7456ff]"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-bold text-sm text-[#17172b]">
              {completionPercentage}%
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm text-[#17172b]">Application Status</h3>
            <span
              className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-1 ${
                isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isSubmitted ? 'Submitted & Dispatched' : 'Draft In Progress'}
            </span>
            <p className="text-[11px] text-[#77788b] mt-1">
              {isSubmitted ? 'All 5 choices sent' : `Step ${application.step || 1} of 10`}
            </p>
          </div>
        </div>

        {/* Next Deadline Card */}
        <div className="bg-white p-6 rounded-[24px] border border-[#e9e7f4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d9ff64] text-[#17172b] flex items-center justify-center shrink-0 font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#77788b] uppercase tracking-wider block">
              Closest Deadline
            </span>
            <h4 className="font-bold text-sm text-[#17172b] truncate max-w-[200px]">
              {nextDeadlineCollege.shortName}
            </h4>
            <p className="text-xs font-semibold text-red-600 mt-0.5">
              {minDaysLeft} Days Remaining ({nextDeadlineCollege.applicationDeadline.split('T')[0]})
            </p>
          </div>
        </div>

        {/* Action summary card */}
        <div className="bg-white p-6 rounded-[24px] border border-[#e9e7f4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eeebff] text-[#7456ff] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#77788b] uppercase tracking-wider block">
              Selected Colleges
            </span>
            <h4 className="font-bold text-sm text-[#17172b]">
              {application.choices.length} of 5 B-Schools Chosen
            </h4>
            <Link to="/apply" className="text-xs font-semibold text-[#7456ff] hover:underline mt-0.5 block">
              Manage choices →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section: Applied Colleges Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#17172b]">My Chosen Colleges Pipeline</h2>
          <Link to="/explore" className="text-xs font-bold text-[#7456ff] hover:underline">
            Explore more colleges →
          </Link>
        </div>

        {application.choices.length === 0 ? (
          <div className="bg-white p-8 rounded-[24px] border border-[#e9e7f4] text-center max-w-md mx-auto">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="font-bold text-base text-[#17172b]">No colleges selected yet</h3>
            <p className="text-xs text-[#77788b] mt-1 mb-4">
              Add up to 5 business schools to your common form.
            </p>
            <Link to="/explore">
              <Button variant="primary" size="sm">
                Browse Directory
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.choices.map((choice) => {
              const col = COLLEGES_DATA.find((c) => c.id === choice.collegeId);
              if (!col) return null;

              return (
                <div
                  key={choice.collegeId}
                  className="bg-white p-5 rounded-[22px] border border-[#e9e7f4] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#7456ff] uppercase">
                        Preference #{choice.preference}
                      </span>
                      <h4 className="font-bold text-base text-[#17172b] leading-tight mt-0.5">
                        {col.name}
                      </h4>
                      <p className="text-xs text-[#77788b] mt-0.5">{col.city} · {choice.programme}</p>
                    </div>

                    <Badge
                      variant={isSubmitted ? 'emerald' : 'purple'}
                      size="sm"
                    >
                      {isSubmitted ? 'Submitted' : 'Draft'}
                    </Badge>
                  </div>

                  {/* Admission Pipeline Stepper */}
                  <div className="pt-2 border-t border-[#e9e7f4]/60">
                    <span className="text-[10px] font-bold text-[#77788b] uppercase tracking-wider block mb-2">
                      Application Status Pipeline
                    </span>
                    <div className="flex items-center justify-between relative">
                      {[
                        { label: 'Submitted', done: isSubmitted },
                        { label: 'Under Review', done: false },
                        { label: 'Shortlisted', done: false },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step.done
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#e9e7f4] text-gray-500'
                            }`}
                          >
                            {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className="text-[10px] font-semibold text-[#77788b] mt-1">
                            {step.label}
                          </span>
                        </div>
                      ))}
                      {/* Connecting Line */}
                      <div className="absolute top-3 left-6 right-6 h-0.5 bg-[#e9e7f4] -z-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Section: Document Checklist & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Checklist */}
        <div className="bg-white p-6 rounded-[24px] border border-[#e9e7f4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#17172b]">Document Checklist</h3>
            <Link to="/apply" className="text-xs text-[#7456ff] font-bold hover:underline">
              Upload Files →
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              '10th Marksheet',
              '12th Marksheet',
              'Graduation Degree / Marksheets',
              'Government ID Proof (Aadhaar / Passport)',
              'Entrance Exam Scorecard',
            ].map((docName) => {
              const isUploaded = application.documents.some((d) => d.type === docName);
              return (
                <div
                  key={docName}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#f8f7ff] border border-[#e9e7f4]/60 text-xs"
                >
                  <span className="font-semibold text-[#17172b]">{docName}</span>
                  {isUploaded ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[#77788b]">Pending</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications (Demo) */}
        <div className="bg-white p-6 rounded-[24px] border border-[#e9e7f4] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#17172b]">Admissions Updates</h3>
            <span className="text-[10px] text-[#77788b]">Real-time Demo Feed</span>
          </div>

          <div className="space-y-3">
            {demoNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl border border-[#e9e7f4] hover:bg-[#f8f7ff] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#17172b]">{notif.title}</h4>
                  <span className="text-[10px] text-[#77788b]">{notif.time}</span>
                </div>
                <p className="text-xs text-[#77788b] mt-1 leading-relaxed">{notif.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
