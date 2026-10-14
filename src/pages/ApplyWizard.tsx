import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  User,
  GraduationCap,
  Award,
  Briefcase,
  FileText,
  UploadCloud,
  CheckCircle2,
  Building2,
  HelpCircle,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  Check,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { useApplicationStore, APPLICATION_FEE_INR } from '../store/applicationStore';
import { useAuthStore } from '../store/authStore';
import { COLLEGES_DATA } from '../data/colleges';
import { Validators } from '../services/validators';
import { GeminiService, SopReviewResult } from '../services/gemini';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { ExamName, ProgrammeType } from '../types';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Academics', icon: GraduationCap },
  { id: 3, title: 'Exam Scores', icon: Award },
  { id: 4, title: 'Work Experience', icon: Briefcase },
  { id: 5, title: 'SOP & Extracurriculars', icon: FileText },
  { id: 6, title: 'Documents', icon: UploadCloud },
  { id: 7, title: 'Choose Colleges', icon: Building2 },
  { id: 8, title: 'College Questions', icon: HelpCircle },
  { id: 9, title: 'Review & Verify', icon: CheckCircle2 },
  { id: 10, title: 'Payment & Submit', icon: CreditCard },
];

export const ApplyWizard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();

  const {
    application,
    profile,
    lastSavedAt,
    setStep,
    updateProfile,
    updateApplication,
    addChoice,
    removeChoice,
    updateChoiceProgramme,
    reorderChoices,
    setExtraAnswer,
    addDocument,
    removeDocument,
    setConsentAccepted,
    setDeclarationAccepted,
    processMockPayment,
  } = useApplicationStore();

  const currentStep = application.step || 1;
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Demo OTP state
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(profile.personal.phoneVerified || false);

  // Step 2: CGPA converter tool state
  const [cgpaInput, setCgpaInput] = useState('');
  const [cgpaTarget, setCgpaTarget] = useState<'tenth' | 'twelfth' | 'graduation'>('graduation');

  // Step 5: SOP AI Review state
  const [isReviewingSop, setIsReviewingSop] = useState(false);
  const [sopResult, setSopResult] = useState<SopReviewResult | null>(null);
  const [showSopModal, setShowSopModal] = useState(false);

  // Step 10: Mock Payment state
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(application.status === 'Submitted');

  // Pre-fill user data from auth if profile is blank
  useEffect(() => {
    if (user?.isLoggedIn && !profile.personal.fullName && user.fullName) {
      updateProfile((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
      }));
    }
  }, [user]);

  // Validation function per step
  const validateStep = (stepNumber: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!Validators.isValidName(profile.personal.fullName)) {
        errs.fullName = 'Full Name must be at least 3 characters.';
      }
      if (!profile.personal.dob) {
        errs.dob = 'Date of Birth is required.';
      } else if (!Validators.isEligibleAge(profile.personal.dob)) {
        errs.dob = 'Age must be between 20 and 35 years as per admission guidelines.';
      }
      if (!Validators.isValidEmail(profile.personal.email)) {
        errs.email = 'Please provide a valid email address.';
      }
      if (!Validators.isValidIndianPhone(profile.personal.phone)) {
        errs.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
      }
      if (!profile.personal.address.line1.trim()) {
        errs.addressLine1 = 'Address Line 1 is required.';
      }
      if (!profile.personal.address.city.trim()) {
        errs.addressCity = 'City is required.';
      }
      if (!Validators.isValidPincode(profile.personal.address.pincode)) {
        errs.addressPincode = 'Must be a 6-digit postal pincode.';
      }
    }

    if (stepNumber === 2) {
      if (!profile.academics.tenth.institution.trim()) {
        errs.tenthInst = '10th Institution / School name is required.';
      }
      if (!Validators.isValidPercentage(profile.academics.tenth.percentage)) {
        errs.tenthPct = 'Percentage must be between 0 and 100.';
      }
      if (!profile.academics.twelfth.institution.trim()) {
        errs.twelfthInst = '12th Institution / Junior College is required.';
      }
      if (!Validators.isValidPercentage(profile.academics.twelfth.percentage)) {
        errs.twelfthPct = 'Percentage must be between 0 and 100.';
      }
      if (!profile.academics.graduation.institution.trim()) {
        errs.gradInst = 'Graduation College / University is required.';
      }
      if (!Validators.isValidPercentage(profile.academics.graduation.percentage)) {
        errs.gradPct = 'Graduation percentage must be between 0 and 100.';
      }
    }

    if (stepNumber === 5) {
      const words = Validators.countWords(profile.sop);
      if (words < 300) {
        errs.sop = `SOP is too short (${words} words). Minimum 300 words required.`;
      }
    }

    if (stepNumber === 7) {
      if (application.choices.length === 0) {
        errs.choices = 'Please choose at least 1 B-school to submit your application.';
      }
    }

    if (stepNumber === 10) {
      if (!application.consentAccepted) {
        errs.consent = 'You must accept the DPDP data processing consent to proceed.';
      }
      if (!application.declarationAccepted) {
        errs.declaration = 'You must declare that all provided statements are true.';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      showToast(`Please correct errors in: ${errs[firstKey]}`, 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 10) {
        setStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Convert CGPA helper
  const handleApplyCgpa = () => {
    const cgpa = parseFloat(cgpaInput);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      showToast('Enter a valid CGPA between 0 and 10', 'warning');
      return;
    }
    const pct = Validators.cgpaToPercentage(cgpa);
    updateProfile((prev) => ({
      ...prev,
      academics: {
        ...prev.academics,
        [cgpaTarget]: {
          ...prev.academics[cgpaTarget],
          percentage: pct,
        },
      },
    }));
    showToast(`Converted CGPA ${cgpa} to ${pct}% for ${cgpaTarget}!`, 'success');
    setCgpaInput('');
  };

  // SOP AI Review trigger
  const handleReviewSopWithAi = async () => {
    if (!profile.sop || profile.sop.trim().length < 50) {
      showToast('Please write your draft SOP before requesting an AI review.', 'warning');
      return;
    }
    setIsReviewingSop(true);
    try {
      const res = await GeminiService.reviewSop(profile.sop, profile.academics.graduation.degree);
      setSopResult(res);
      setShowSopModal(true);
      showToast('AI review completed!', 'success');
    } catch {
      showToast('The AI is busy, please try again.', 'error');
    } finally {
      setIsReviewingSop(false);
    }
  };

  // Mock Payment Flow
  const handleExecuteMockPayment = () => {
    if (!validateStep(10)) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const { receiptNo } = processMockPayment();
      setIsProcessingPayment(false);
      setPaymentDone(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast(`Payment successful! Receipt ${receiptNo}`, 'success');
    }, 2000);
  };

  // Printable HTML receipt generator
  const handleDownloadReceipt = () => {
    const payment = application.payment;
    if (!payment) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${payment.receiptNo}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #17172b; max-width: 700px; margin: auto; }
          .header { border-bottom: 2px solid #7456ff; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #17172b; }
          .logo span { color: #7456ff; }
          .meta { font-size: 13px; color: #77788b; margin-top: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px; }
          .table th, .table td { padding: 12px; border-bottom: 1px solid #e9e7f4; text-align: left; }
          .table th { background: #f8f7ff; }
          .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 15px; }
          .footer { margin-top: 40px; font-size: 11px; color: #77788b; border-top: 1px solid #e9e7f4; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ConfirmMy<span>College</span></div>
          <div class="meta">Official Application Fee Receipt (Demo Prototype)</div>
          <div class="meta">Receipt No: <strong>${payment.receiptNo}</strong> | Date: ${new Date(payment.paidAt).toLocaleString()}</div>
        </div>
        <p><strong>Applicant Name:</strong> ${profile.personal.fullName || 'Candidate'}</p>
        <p><strong>Email:</strong> ${profile.personal.email || 'N/A'} | <strong>Phone:</strong> ${profile.personal.phone || 'N/A'}</p>
        <table class="table">
          <thead>
            <tr>
              <th>Particulars</th>
              <th>Colleges Covered</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ConfirmMyCollege Common Application Fee</td>
              <td>${application.choices.length} B-Schools</td>
              <td>₹${APPLICATION_FEE_INR}.00</td>
            </tr>
          </tbody>
        </table>
        <div class="total">Total Paid: ₹${APPLICATION_FEE_INR}.00 (Mock Transaction)</div>
        <div class="footer">
          <p><strong>Note:</strong> ConfirmMyCollege is a prototype demonstration platform. No real monetary transaction has been executed. No guarantee of admission.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${payment.receiptNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-5 sm:px-7 py-8 text-left">
      {/* Mobile Top Progress Indicator */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#17172b] mb-2">
          <span>
            Step {currentStep} of 10: {STEPS[currentStep - 1]?.title}
          </span>
          <span className="text-[#7456ff]">{Math.round((currentStep / 10) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-[#e9e7f4] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#7456ff] h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Layout: Left Stepper + Right Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Vertical Stepper (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-[24px] border border-[#e9e7f4] shadow-[0_8px_24px_rgba(33,25,76,0.04)] sticky top-24">
          <div className="pb-4 mb-4 border-b border-[#e9e7f4]">
            <span className="text-[11px] font-bold text-[#77788b] uppercase tracking-wider block">
              Common Application Form
            </span>
            <h2 className="font-bold text-base text-[#17172b] mt-0.5">Application Wizard</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Autosaved at {lastSavedAt}</span>
            </div>
          </div>

          <div className="space-y-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isDone = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    // Allow navigating backward or to current freely
                    if (step.id <= currentStep) setStep(step.id);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#eeebff] text-[#7456ff] font-bold shadow-xs'
                      : isDone
                      ? 'text-[#17172b] hover:bg-gray-50'
                      : 'text-gray-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-[#7456ff] text-white'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span className="text-xs truncate">{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#e9e7f4] text-center">
            <Link to="/dashboard" className="text-xs font-semibold text-[#77788b] hover:underline">
              Save draft and exit →
            </Link>
          </div>
        </aside>

        {/* Right Form Card */}
        <main className="lg:col-span-9 bg-white rounded-[28px] border border-[#e9e7f4] p-6 sm:p-10 shadow-[0_12px_32px_rgba(33,25,76,0.06)]">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#e9e7f4] gap-2">
            <div>
              <span className="text-xs font-bold text-[#7456ff] uppercase tracking-wider block">
                Step {currentStep} of 10
              </span>
              <h2 className="text-2xl font-bold text-[#17172b] tracking-tight">
                {STEPS[currentStep - 1]?.title}
              </h2>
            </div>
            <div className="text-xs text-[#77788b] flex items-center gap-1.5 self-start sm:self-center">
              <Clock className="w-3.5 h-3.5" />
              <span>Autosave active ({lastSavedAt})</span>
            </div>
          </div>

          {/* ================= STEP 1: PERSONAL INFO ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Legal Name (as per 10th marksheet)"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={profile.personal.fullName}
                  error={errors.fullName}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: { ...p.personal, fullName: e.target.value },
                    }))
                  }
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  helperText="Applicant must be between 20-35 years of age."
                  value={profile.personal.dob}
                  error={errors.dob}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: { ...p.personal, dob: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Gender"
                  required
                  value={profile.personal.gender}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Non-Binary / Other', value: 'Other' },
                  ]}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: { ...p.personal, gender: e.target.value },
                    }))
                  }
                />

                <Select
                  label="Reservation Category"
                  required
                  value={profile.personal.category}
                  options={[
                    { label: 'General', value: 'General' },
                    { label: 'OBC (Non-Creamy)', value: 'OBC' },
                    { label: 'SC', value: 'SC' },
                    { label: 'ST', value: 'ST' },
                    { label: 'EWS', value: 'EWS' },
                    { label: 'PwD', value: 'PwD' },
                  ]}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: { ...p.personal, category: e.target.value as any },
                    }))
                  }
                />

                <Input
                  label="Nationality"
                  required
                  value={profile.personal.nationality}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: { ...p.personal, nationality: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="rahul.sharma@example.com"
                  value={profile.personal.email}
                  error={errors.email}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: { ...p.personal, email: e.target.value },
                    }))
                  }
                />

                {/* Mobile Phone + Demo OTP */}
                <div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        label="Mobile Number (Indian)"
                        required
                        placeholder="9876543210"
                        value={profile.personal.phone}
                        error={errors.phone}
                        onChange={(e) =>
                          updateProfile((p) => ({
                            ...p,
                            personal: { ...p.personal, phone: e.target.value },
                          }))
                        }
                      />
                    </div>
                    {!otpVerified ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          if (Validators.isValidIndianPhone(profile.personal.phone)) {
                            setShowOtpField(true);
                            showToast('Demo OTP generated: Enter any 6 digits (e.g. 123456)', 'info');
                          } else {
                            showToast('Enter a valid 10-digit number first', 'warning');
                          }
                        }}
                      >
                        Verify OTP
                      </Button>
                    ) : (
                      <div className="h-12 px-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  {showOtpField && !otpVerified && (
                    <div className="mt-2 p-3 bg-[#eeebff] rounded-xl flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit Demo OTP"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-[#7456ff]/40 bg-white text-xs w-44"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (otpValue.length === 6) {
                            setOtpVerified(true);
                            setShowOtpField(false);
                            updateProfile((p) => ({
                              ...p,
                              personal: { ...p.personal, phoneVerified: true },
                            }));
                            showToast('Phone verified successfully (Demo)!', 'success');
                          } else {
                            showToast('Please enter any 6-digit code', 'warning');
                          }
                        }}
                      >
                        Confirm OTP
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-3 pt-2 border-t border-[#e9e7f4]">
                <h4 className="font-bold text-sm text-[#17172b]">Residential Address</h4>
                <Input
                  label="Address Line 1"
                  required
                  placeholder="Flat/House No., Street, Locality"
                  value={profile.personal.address.line1}
                  error={errors.addressLine1}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      personal: {
                        ...p.personal,
                        address: { ...p.personal.address, line1: e.target.value },
                      },
                    }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    required
                    placeholder="e.g. Pune"
                    value={profile.personal.address.city}
                    error={errors.addressCity}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        personal: {
                          ...p.personal,
                          address: { ...p.personal.address, city: e.target.value },
                        },
                      }))
                    }
                  />

                  <Input
                    label="State"
                    required
                    placeholder="e.g. Maharashtra"
                    value={profile.personal.address.state}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        personal: {
                          ...p.personal,
                          address: { ...p.personal.address, state: e.target.value },
                        },
                      }))
                    }
                  />

                  <Input
                    label="Pincode"
                    required
                    maxLength={6}
                    placeholder="411001"
                    value={profile.personal.address.pincode}
                    error={errors.addressPincode}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        personal: {
                          ...p.personal,
                          address: { ...p.personal.address, pincode: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Photo & Signature Upload Mock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e9e7f4]">
                <div className="p-4 rounded-2xl border border-dashed border-[#e9e7f4] bg-[#f8f7ff] text-center">
                  <span className="text-xs font-bold text-[#17172b] block mb-1">
                    Passport Photo (Max 200 KB)
                  </span>
                  <span className="text-[11px] text-[#77788b] block mb-3">Square JPG/PNG format</span>
                  <div className="w-20 h-20 bg-white rounded-xl mx-auto border border-[#e9e7f4] flex items-center justify-center text-[#7456ff] font-bold text-xs mb-2 shadow-2xs">
                    {profile.personal.fullName ? profile.personal.fullName.substring(0, 2).toUpperCase() : 'Photo'}
                  </div>
                  <label className="text-xs font-bold text-[#7456ff] cursor-pointer hover:underline">
                    Browse & Upload
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          showToast(`Uploaded ${file.name} (Photo demo)`, 'success');
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-[#e9e7f4] bg-[#f8f7ff] text-center">
                  <span className="text-xs font-bold text-[#17172b] block mb-1">
                    Specimen Signature (Max 100 KB)
                  </span>
                  <span className="text-[11px] text-[#77788b] block mb-3">Clear signature on white paper</span>
                  <div className="w-32 h-14 bg-white rounded-xl mx-auto border border-[#e9e7f4] flex items-center justify-center text-[#77788b] italic text-xs mb-2 shadow-2xs">
                    {profile.personal.fullName || 'Sign here'}
                  </div>
                  <label className="text-xs font-bold text-[#7456ff] cursor-pointer hover:underline">
                    Browse & Upload
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          showToast(`Uploaded ${file.name} (Signature demo)`, 'success');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: ACADEMICS ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* CGPA to Percentage Converter Helper Widget */}
              <div className="p-4 bg-[#eeebff] rounded-2xl border border-[#7456ff]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-[#7456ff] block">CGPA-to-Percentage Converter</span>
                  <span className="text-[#77788b]">Convert standard 10-point scale CGPA × 9.5 automatically.</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8.4"
                    value={cgpaInput}
                    onChange={(e) => setCgpaInput(e.target.value)}
                    className="w-24 h-9 px-2 rounded-lg border border-[#7456ff]/40 bg-white text-xs outline-none"
                  />
                  <select
                    value={cgpaTarget}
                    onChange={(e) => setCgpaTarget(e.target.value as any)}
                    className="h-9 px-2 rounded-lg border border-[#7456ff]/40 bg-white text-xs font-medium"
                  >
                    <option value="graduation">Graduation</option>
                    <option value="twelfth">12th</option>
                    <option value="tenth">10th</option>
                  </select>
                  <Button variant="primary" size="sm" onClick={handleApplyCgpa}>
                    Apply
                  </Button>
                </div>
              </div>

              {/* 10th Standard */}
              <div className="p-5 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] space-y-4">
                <h4 className="font-bold text-sm text-[#17172b]">Class 10th (Secondary)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="Board"
                    required
                    placeholder="e.g. CBSE / ICSE / State"
                    value={profile.academics.tenth.board}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          tenth: { ...p.academics.tenth, board: e.target.value },
                        },
                      }))
                    }
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="School / Institution Name"
                      required
                      placeholder="e.g. St. Xavier's High School"
                      value={profile.academics.tenth.institution}
                      error={errors.tenthInst}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          academics: {
                            ...p.academics,
                            tenth: { ...p.academics.tenth, institution: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                  <Input
                    label="Percentage (%)"
                    type="number"
                    step="0.01"
                    required
                    value={profile.academics.tenth.percentage}
                    error={errors.tenthPct}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          tenth: { ...p.academics.tenth, percentage: parseFloat(e.target.value) || 0 },
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* 12th Standard */}
              <div className="p-5 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] space-y-4">
                <h4 className="font-bold text-sm text-[#17172b]">Class 12th (Higher Secondary)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Input
                    label="Board"
                    required
                    placeholder="e.g. CBSE / ISC / State"
                    value={profile.academics.twelfth.board}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          twelfth: { ...p.academics.twelfth, board: e.target.value },
                        },
                      }))
                    }
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="College / Institution"
                      required
                      placeholder="e.g. Modern Junior College"
                      value={profile.academics.twelfth.institution}
                      error={errors.twelfthInst}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          academics: {
                            ...p.academics,
                            twelfth: { ...p.academics.twelfth, institution: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                  <Input
                    label="Percentage (%)"
                    type="number"
                    step="0.01"
                    required
                    value={profile.academics.twelfth.percentage}
                    error={errors.twelfthPct}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          twelfth: { ...p.academics.twelfth, percentage: parseFloat(e.target.value) || 0 },
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Graduation */}
              <div className="p-5 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#17172b]">Graduation / Bachelor’s Degree</h4>
                  {profile.academics.graduation.percentage < 50 && (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Warning: Most B-schools require 50% minimum.</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Degree (e.g. B.Tech, B.Com, BBA)"
                    required
                    value={profile.academics.graduation.degree}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          graduation: { ...p.academics.graduation, degree: e.target.value },
                        },
                      }))
                    }
                  />
                  <Input
                    label="Specialisation / Stream"
                    required
                    placeholder="e.g. Mechanical / Finance"
                    value={profile.academics.graduation.stream}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          graduation: { ...p.academics.graduation, stream: e.target.value },
                        },
                      }))
                    }
                  />
                  <Input
                    label="Passing Year"
                    type="number"
                    min="1995"
                    max={new Date().getFullYear()}
                    value={profile.academics.graduation.yearOfPassing}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          graduation: { ...p.academics.graduation, yearOfPassing: parseInt(e.target.value) || 2024 },
                        },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="University / Institute"
                      required
                      placeholder="e.g. Mumbai University"
                      value={profile.academics.graduation.institution}
                      error={errors.gradInst}
                      onChange={(e) =>
                        updateProfile((p) => ({
                          ...p,
                          academics: {
                            ...p.academics,
                            graduation: { ...p.academics.graduation, institution: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                  <Input
                    label="Aggregate Percentage (%)"
                    type="number"
                    step="0.01"
                    required
                    value={profile.academics.graduation.percentage}
                    error={errors.gradPct}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        academics: {
                          ...p.academics,
                          graduation: { ...p.academics.graduation, percentage: parseFloat(e.target.value) || 0 },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: EXAM SCORES ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#77788b]">
                  Add all MBA entrance examinations you have taken or registered for.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    updateProfile((p) => ({
                      ...p,
                      exams: [
                        ...p.exams,
                        {
                          name: 'XAT',
                          year: 2026,
                          score: 0,
                          percentile: 0,
                          rollNo: '',
                          notTaken: false,
                        },
                      ],
                    }));
                  }}
                >
                  + Add Another Exam
                </Button>
              </div>

              <div className="space-y-4">
                {profile.exams.map((examRow, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] relative space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#7456ff]">Exam Record #{idx + 1}</span>
                      {profile.exams.length > 1 && (
                        <button
                          onClick={() => {
                            updateProfile((p) => ({
                              ...p,
                              exams: p.exams.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <Select
                        label="Entrance Test"
                        value={examRow.name}
                        options={[
                          { label: 'CAT', value: 'CAT' },
                          { label: 'XAT', value: 'XAT' },
                          { label: 'SNAP', value: 'SNAP' },
                          { label: 'NMAT', value: 'NMAT' },
                          { label: 'CMAT', value: 'CMAT' },
                          { label: 'GMAT', value: 'GMAT' },
                          { label: 'MAT', value: 'MAT' },
                        ]}
                        onChange={(e) => {
                          const val = e.target.value as ExamName;
                          updateProfile((p) => {
                            const updated = [...p.exams];
                            updated[idx] = { ...updated[idx], name: val };
                            return { ...p, exams: updated };
                          });
                        }}
                      />

                      <Input
                        label="Registration / Roll No."
                        placeholder="e.g. 25019284"
                        value={examRow.rollNo}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProfile((p) => {
                            const updated = [...p.exams];
                            updated[idx] = { ...updated[idx], rollNo: val };
                            return { ...p, exams: updated };
                          });
                        }}
                      />

                      <Input
                        label="Raw Score"
                        type="number"
                        placeholder="e.g. 78"
                        disabled={examRow.notTaken}
                        value={examRow.score || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateProfile((p) => {
                            const updated = [...p.exams];
                            updated[idx] = { ...updated[idx], score: val };
                            return { ...p, exams: updated };
                          });
                        }}
                      />

                      <Input
                        label="Percentile (%ile)"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 94.2"
                        disabled={examRow.notTaken}
                        value={examRow.percentile || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateProfile((p) => {
                            const updated = [...p.exams];
                            updated[idx] = { ...updated[idx], percentile: val };
                            return { ...p, exams: updated };
                          });
                        }}
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-[#77788b] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={examRow.notTaken || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          updateProfile((p) => {
                            const updated = [...p.exams];
                            updated[idx] = { ...updated[idx], notTaken: checked };
                            return { ...p, exams: updated };
                          });
                        }}
                        className="rounded border-[#e9e7f4] text-[#7456ff]"
                      />
                      <span>Awaiting test result / Taking test in upcoming session</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 4: WORK EXPERIENCE ================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#f8f7ff] rounded-2xl border border-[#e9e7f4]">
                <div>
                  <h4 className="font-bold text-sm text-[#17172b]">Are you a College Fresher?</h4>
                  <p className="text-xs text-[#77788b]">
                    Fresh graduates with no full-time post-degree work experience should select this option.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-[#17172b]">
                    {profile.isFresher ? 'Yes, I am a Fresher' : 'No, I have experience'}
                  </span>
                  <input
                    type="checkbox"
                    checked={profile.isFresher ?? true}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        isFresher: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-[#7456ff] rounded focus:ring-[#7456ff]"
                  />
                </label>
              </div>

              {!profile.isFresher && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#77788b]">
                      Total Work Experience:{' '}
                      <strong className="text-[#7456ff]">
                        {Validators.calculateWorkExperienceMonths(profile.work)} Months
                      </strong>
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => {
                        updateProfile((p) => ({
                          ...p,
                          work: [
                            ...p.work,
                            {
                              employer: '',
                              role: '',
                              fromMonth: '2023-06',
                              toMonth: '2024-06',
                              description: '',
                            },
                          ],
                        }));
                      }}
                    >
                      + Add Employer
                    </Button>
                  </div>

                  {profile.work.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] space-y-4 relative"
                    >
                      <button
                        onClick={() => {
                          updateProfile((p) => ({
                            ...p,
                            work: p.work.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Employer / Organisation"
                          required
                          placeholder="e.g. Infosys Ltd."
                          value={w.employer}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateProfile((p) => {
                              const updated = [...p.work];
                              updated[idx] = { ...updated[idx], employer: val };
                              return { ...p, work: updated };
                            });
                          }}
                        />

                        <Input
                          label="Designation / Role"
                          required
                          placeholder="e.g. Associate Systems Engineer"
                          value={w.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateProfile((p) => {
                              const updated = [...p.work];
                              updated[idx] = { ...updated[idx], role: val };
                              return { ...p, work: updated };
                            });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="From Month (YYYY-MM)"
                          type="month"
                          value={w.fromMonth}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateProfile((p) => {
                              const updated = [...p.work];
                              updated[idx] = { ...updated[idx], fromMonth: val };
                              return { ...p, work: updated };
                            });
                          }}
                        />

                        <Input
                          label="To Month (YYYY-MM)"
                          type="month"
                          value={w.toMonth}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateProfile((p) => {
                              const updated = [...p.work];
                              updated[idx] = { ...updated[idx], toMonth: val };
                              return { ...p, work: updated };
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#17172b] block mb-1">
                          Role Responsibilities & Achievements
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Key initiatives delivered, client accounts managed, software frameworks used..."
                          value={w.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateProfile((p) => {
                              const updated = [...p.work];
                              updated[idx] = { ...updated[idx], description: val };
                              return { ...p, work: updated };
                            });
                          }}
                          className="w-full p-3 rounded-xl border border-[#e9e7f4] bg-white text-xs outline-none focus:border-[#7456ff]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 5: SOP & EXTRAS ================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* SOP Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="text-sm font-bold text-[#17172b]">
                      Statement of Purpose (SOP) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-[#77788b]">
                      Recommended length: 300 to 500 words. Explain why you want an MBA and your future goals.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    isLoading={isReviewingSop}
                    icon={<Sparkles className="w-4 h-4 text-[#7456ff]" />}
                    onClick={handleReviewSopWithAi}
                  >
                    Review with AI (Gemini)
                  </Button>
                </div>

                <div className="relative">
                  <textarea
                    rows={9}
                    placeholder="Describe your academic foundation, pivotal career milestones, leadership experiences, and how an MBA programme will enable you to achieve your target aspirations..."
                    value={profile.sop}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        sop: e.target.value,
                      }))
                    }
                    className={`w-full p-4 rounded-2xl border text-sm text-[#17172b] leading-relaxed outline-none transition-all ${
                      errors.sop
                        ? 'border-red-400 focus:ring-4 focus:ring-red-100'
                        : 'border-[#e9e7f4] focus:border-[#7456ff] focus:ring-4 focus:ring-[#7456ff]/20'
                    }`}
                  />

                  {/* Word count status indicator */}
                  {(() => {
                    const count = Validators.countWords(profile.sop);
                    const state = Validators.getSopState(count);
                    return (
                      <div className="flex items-center justify-between mt-2 text-xs">
                        {errors.sop && <span className="text-red-500 font-medium">{errors.sop}</span>}
                        {!errors.sop && <span className="text-[#77788b]">Ideal target: 300-500 words</span>}
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            state === 'too-short'
                              ? 'bg-red-100 text-red-700'
                              : state === 'in-range'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {count} words ({state === 'too-short' ? 'Below 300' : state === 'in-range' ? 'Target Range' : 'Above 500'})
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Achievements & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#e9e7f4]">
                <div>
                  <label className="text-xs font-bold text-[#17172b] block mb-1">
                    Key Academic & Professional Achievements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Scholarships, hackathon wins, dean's honors list, sales targets exceeded..."
                    value={profile.achievements}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        achievements: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-[#e9e7f4] text-xs outline-none focus:border-[#7456ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#17172b] block mb-1">
                    Certifications & Online Courses
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. CFA Level 1, Google Analytics, Financial Modelling (Coursera), NISM..."
                    value={profile.certifications}
                    onChange={(e) =>
                      updateProfile((p) => ({
                        ...p,
                        certifications: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-[#e9e7f4] text-xs outline-none focus:border-[#7456ff]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: DOCUMENTS ================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <p className="text-xs text-[#77788b]">
                Upload digital copies (PDF, JPG, PNG up to 2 MB) of your marksheets and identity cards.
                In this demo environment, files are processed and tracked securely.
              </p>

              {[
                { type: '10th Marksheet', req: true },
                { type: '12th Marksheet', req: true },
                { type: 'Graduation Degree / Marksheets', req: true },
                { type: 'Government ID Proof (Aadhaar / Passport)', req: true },
                { type: 'Entrance Exam Scorecard (CAT/XAT)', req: true },
                { type: 'Category / Caste Certificate', req: profile.personal.category !== 'General' },
                { type: 'Work Experience Relieving Letters', req: !profile.isFresher },
              ].map((docType) => {
                const uploaded = application.documents.find((d) => d.type === docType.type);
                return (
                  <div
                    key={docType.type}
                    className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#e9e7f4] flex items-center justify-center text-[#7456ff]">
                        {uploaded ? <FileCheck className="w-5 h-5 text-emerald-600" /> : <UploadCloud className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#17172b]">
                          {docType.type} {docType.req && <span className="text-red-500">*</span>}
                        </h4>
                        {uploaded ? (
                          <span className="text-xs text-emerald-700 font-semibold">
                            {uploaded.fileName} ({(uploaded.sizeKb / 1024).toFixed(1)} MB) · Uploaded
                          </span>
                        ) : (
                          <span className="text-xs text-[#77788b]">Pending upload (Max 2 MB)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => removeDocument(docType.type)}
                          className="text-xs text-red-500 hover:underline font-semibold p-1"
                        >
                          Remove
                        </button>
                      ) : (
                        <label className="cursor-pointer">
                          <span className="text-xs font-bold bg-white text-[#7456ff] border border-[#e9e7f4] hover:bg-[#eeebff] px-3.5 py-2 rounded-xl inline-block transition-colors">
                            Upload File
                          </span>
                          <input
                            type="file"
                            accept=".pdf, image/jpeg, image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                addDocument({
                                  type: docType.type,
                                  fileName: file.name,
                                  sizeKb: Math.round(file.size / 1024),
                                  uploadedAt: new Date().toISOString(),
                                });
                                showToast(`Uploaded ${file.name}`, 'success');
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= STEP 7: CHOOSE COLLEGES ================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#e9e7f4]">
                <div>
                  <h3 className="font-bold text-base text-[#17172b]">
                    Target Colleges ({application.choices.length} of 5 selected)
                  </h3>
                  <p className="text-xs text-[#77788b]">
                    Your single application fee covers up to 5 participating B-schools. Reorder by preference.
                  </p>
                </div>
                {errors.choices && <span className="text-xs text-red-500 font-bold">{errors.choices}</span>}
              </div>

              {/* Chosen Colleges List */}
              <div className="space-y-3">
                {application.choices.map((choice, index) => {
                  const college = COLLEGES_DATA.find((c) => c.id === choice.collegeId);
                  if (!college) return null;
                  const daysLeft = Math.ceil(
                    (new Date(college.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isDeadlinePassed = daysLeft < 0;

                  return (
                    <div
                      key={choice.collegeId}
                      className="p-4 rounded-2xl border border-[#7456ff]/30 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#eeebff] text-[#7456ff] font-extrabold text-sm flex items-center justify-center shrink-0">
                          #{choice.preference}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#17172b]">{college.name}</h4>
                          <span className="text-xs text-[#77788b]">{college.city} · Cutoff {college.minPercentile}%ile</span>
                          {isDeadlinePassed ? (
                            <span className="text-[11px] font-bold text-red-600 block mt-0.5">
                              Deadline passed ({college.applicationDeadline.split('T')[0]})
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                              {daysLeft} days left to apply
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Programme Selector */}
                        <select
                          value={choice.programme}
                          onChange={(e) =>
                            updateChoiceProgramme(college.id, e.target.value as ProgrammeType)
                          }
                          className="h-10 px-3 rounded-xl border border-[#e9e7f4] text-xs font-semibold bg-[#f8f7ff]"
                        >
                          {college.programmes.map((p) => (
                            <option key={p.type} value={p.type}>
                              {p.type} (₹{(p.totalFeeInr / 100000).toFixed(1)}L)
                            </option>
                          ))}
                        </select>

                        {/* Reorder Up/Down */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => reorderChoices(index, index - 1)}
                            className="p-1.5 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === application.choices.length - 1}
                            onClick={() => reorderChoices(index, index + 1)}
                            className="p-1.5 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded"
                          >
                            ▼
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeChoice(college.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add more colleges picker */}
              {application.choices.length < 5 && (
                <div className="p-4 rounded-2xl border border-dashed border-[#e9e7f4] bg-[#f8f7ff]">
                  <span className="text-xs font-bold text-[#17172b] block mb-2">
                    Add another B-school (Up to {5 - application.choices.length} remaining):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COLLEGES_DATA.filter(
                      (c) => !application.choices.some((ch) => ch.collegeId === c.id)
                    ).map((col) => (
                      <div
                        key={col.id}
                        className="p-3 bg-white rounded-xl border border-[#e9e7f4] flex items-center justify-between hover:border-[#7456ff]"
                      >
                        <div>
                          <h5 className="font-bold text-xs text-[#17172b]">{col.shortName}</h5>
                          <span className="text-[11px] text-[#77788b]">{col.city} · Min {col.minPercentile}%ile</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const res = addChoice(col.id, col.programmes[0]?.type || 'PGDM');
                            if (!res.success) {
                              showToast(res.message || 'Limit reached', 'warning');
                            }
                          }}
                        >
                          + Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 8: COLLEGE-SPECIFIC QUESTIONS ================= */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <p className="text-xs text-[#77788b]">
                These custom questions are set by your chosen institutions. Any answers matching your
                common data have been auto-populated.
              </p>

              {application.choices.length === 0 ? (
                <p className="text-xs text-gray-500">Please choose at least one college in Step 7.</p>
              ) : (
                application.choices.map((choice) => {
                  const college = COLLEGES_DATA.find((c) => c.id === choice.collegeId);
                  if (!college || college.extraQuestions.length === 0) return null;

                  return (
                    <div
                      key={choice.collegeId}
                      className="p-6 rounded-2xl border border-[#e9e7f4] bg-white space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#e9e7f4]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[#7456ff]" />
                          <h3 className="font-bold text-base text-[#17172b]">{college.name}</h3>
                        </div>
                        <Badge variant="purple" size="sm">
                          Auto-filled from common data
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {college.extraQuestions.map((q) => {
                          const currentAnswer =
                            application.extraAnswers[college.id]?.[q.id] ?? '';

                          return (
                            <div key={q.id}>
                              <label className="text-xs font-bold text-[#17172b] block mb-1">
                                {q.label} {q.required && <span className="text-red-500">*</span>}
                              </label>

                              {q.type === 'textarea' ? (
                                <textarea
                                  rows={3}
                                  placeholder="Your answer..."
                                  value={String(currentAnswer)}
                                  onChange={(e) =>
                                    setExtraAnswer(college.id, q.id, e.target.value)
                                  }
                                  className="w-full p-3 rounded-xl border border-[#e9e7f4] text-xs outline-none focus:border-[#7456ff]"
                                />
                              ) : q.type === 'select' ? (
                                <select
                                  value={String(currentAnswer)}
                                  onChange={(e) =>
                                    setExtraAnswer(college.id, q.id, e.target.value)
                                  }
                                  className="w-full h-11 px-3 rounded-xl border border-[#e9e7f4] text-xs bg-white"
                                >
                                  <option value="">-- Select an option --</option>
                                  {q.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : q.type === 'checkbox' ? (
                                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(currentAnswer)}
                                    onChange={(e) =>
                                      setExtraAnswer(college.id, q.id, e.target.checked)
                                    }
                                    className="w-4 h-4 text-[#7456ff] rounded"
                                  />
                                  <span>Yes / Confirm</span>
                                </label>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Your response..."
                                  value={String(currentAnswer)}
                                  onChange={(e) =>
                                    setExtraAnswer(college.id, q.id, e.target.value)
                                  }
                                  className="w-full h-11 px-3 rounded-xl border border-[#e9e7f4] text-xs outline-none focus:border-[#7456ff]"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ================= STEP 9: REVIEW & VERIFY ================= */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    Application Completeness Check: Ready for Final Submission
                  </span>
                </div>
              </div>

              {/* Review Sections */}
              <div className="space-y-4">
                {/* 1. Personal */}
                <div className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-[#17172b]">1. Personal Details</h4>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-[#7456ff] font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#77788b]">
                    <strong>Name:</strong> {profile.personal.fullName} | <strong>DOB:</strong> {profile.personal.dob} |{' '}
                    <strong>Email:</strong> {profile.personal.email} | <strong>Phone:</strong> {profile.personal.phone}
                  </p>
                </div>

                {/* 2. Academics */}
                <div className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-[#17172b]">2. Academic Record</h4>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-[#7456ff] font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#77788b]">
                    <strong>10th:</strong> {profile.academics.tenth.percentage}% |{' '}
                    <strong>12th:</strong> {profile.academics.twelfth.percentage}% |{' '}
                    <strong>Graduation:</strong> {profile.academics.graduation.degree} ({profile.academics.graduation.percentage}%)
                  </p>
                </div>

                {/* 3. Chosen Colleges */}
                <div className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-[#17172b]">
                      3. Selected Colleges ({application.choices.length} Colleges)
                    </h4>
                    <button
                      onClick={() => setStep(7)}
                      className="text-xs text-[#7456ff] font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.choices.map((c) => {
                      const col = COLLEGES_DATA.find((x) => x.id === c.collegeId);
                      return (
                        <span
                          key={c.collegeId}
                          className="bg-white border border-[#e9e7f4] text-xs font-semibold px-2.5 py-1 rounded-lg text-[#17172b]"
                        >
                          #{c.preference} {col?.shortName} ({c.programme})
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Documents */}
                <div className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-[#17172b]">
                      4. Uploaded Marksheets & ID ({application.documents.length} files)
                    </h4>
                    <button
                      onClick={() => setStep(6)}
                      className="text-xs text-[#7456ff] font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-[#77788b]">
                    {application.documents.map((d) => d.type).join(', ') || 'No documents uploaded yet.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 10: PAYMENT & SUBMIT ================= */}
          {currentStep === 10 && (
            <div className="space-y-6">
              {paymentDone ? (
                /* Success Screen */
                <div className="p-8 text-center bg-[#f8f7ff] rounded-3xl border border-emerald-200 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#17172b]">
                    Application Submitted Successfully!
                  </h3>
                  <p className="text-sm text-[#77788b] max-w-md mx-auto">
                    Your single application package fee has been received in demo mode. All{' '}
                    <strong>{application.choices.length} B-schools</strong> have received your unified profile.
                  </p>

                  <div className="p-4 bg-white rounded-2xl border border-[#e9e7f4] max-w-xs mx-auto text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#77788b]">Receipt No:</span>
                      <strong className="text-[#7456ff]">{application.payment?.receiptNo}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77788b]">Amount:</span>
                      <strong>₹{APPLICATION_FEE_INR}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77788b]">Status:</span>
                      <span className="text-emerald-700 font-bold">Confirmed</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/dashboard')}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Go to Application Dashboard
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDownloadReceipt}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Download Receipt
                    </Button>
                  </div>
                </div>
              ) : (
                /* Payment Checkout */
                <div className="space-y-6">
                  {/* Declarations */}
                  <div className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff] space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={application.declarationAccepted || false}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="w-4 h-4 text-[#7456ff] mt-0.5 rounded"
                      />
                      <span className="text-xs text-[#17172b] leading-relaxed">
                        I hereby declare that all academic, personal, and entrance exam credentials provided
                        in this common application are authentic and true to the best of my knowledge.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={application.consentAccepted || false}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="w-4 h-4 text-[#7456ff] mt-0.5 rounded"
                      />
                      <span className="text-xs text-[#17172b] leading-relaxed">
                        I grant consent under the Digital Personal Data Protection Act 2023 for my application
                        data to be shared solely with my selected partner institutions.
                      </span>
                    </label>
                  </div>

                  {/* Fee Summary */}
                  <div className="p-5 rounded-2xl border border-[#7456ff]/30 bg-[#eeebff]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-base text-[#17172b]">
                        One Application Fee (Up to 5 B-Schools)
                      </h4>
                      <p className="text-xs text-[#77788b]">
                        Package price set by platform administrator · No recurring charges
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#7456ff]">₹{APPLICATION_FEE_INR}</span>
                      <span className="text-[11px] text-[#77788b] block">Demo amount</span>
                    </div>
                  </div>

                  {/* Razorpay-style Mock Checkout Card */}
                  <div className="border border-[#e9e7f4] rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="bg-[#17172b] p-4 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#d9ff64]" />
                        <span className="font-bold text-sm">Secure Checkout (Demo)</span>
                      </div>
                      <Badge variant="lime" size="sm">
                        DEMO GATEWAY
                      </Badge>
                    </div>

                    {/* Payment Mode Tabs */}
                    <div className="flex border-b border-[#e9e7f4] bg-gray-50/50">
                      {[
                        { id: 'upi', label: 'UPI / QR' },
                        { id: 'card', label: 'Debit / Credit Card' },
                        { id: 'netbanking', label: 'Net Banking' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPaymentTab(tab.id as any)}
                          className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                            paymentTab === tab.id
                              ? 'border-[#7456ff] text-[#7456ff] bg-white'
                              : 'border-transparent text-gray-500'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-6">
                      {paymentTab === 'upi' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-[#17172b] block">
                            Enter Virtual Payment Address (VPA / UPI ID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. mobile@okhdfcbank"
                            defaultValue="applicant@upi"
                            className="w-full h-11 px-3 rounded-xl border border-[#e9e7f4] text-xs"
                          />
                          <p className="text-[11px] text-[#77788b]">
                            Supports Google Pay, PhonePe, Paytm, and BHIM UPI.
                          </p>
                        </div>
                      )}

                      {paymentTab === 'card' && (
                        <div className="space-y-3">
                          <Input label="Card Number" placeholder="4111 2222 3333 4444" defaultValue="4111 2222 3333 4444" />
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Valid Thru" placeholder="MM/YY" defaultValue="12/28" />
                            <Input label="CVV" placeholder="123" defaultValue="789" />
                          </div>
                        </div>
                      )}

                      {paymentTab === 'netbanking' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-[#17172b] block">Choose Bank</label>
                          <select className="w-full h-11 px-3 rounded-xl border border-[#e9e7f4] text-xs bg-white">
                            <option>HDFC Bank</option>
                            <option>State Bank of India (SBI)</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                          </select>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-[#e9e7f4]">
                        <Button
                          variant="primary"
                          size="lg"
                          isLoading={isProcessingPayment}
                          className="w-full text-base"
                          onClick={handleExecuteMockPayment}
                        >
                          Pay ₹{APPLICATION_FEE_INR} & Submit Application
                        </Button>
                        <p className="text-[11px] text-[#77788b] text-center mt-2 font-medium">
                          DEMO PAYMENT. No real money will be charged. Simulates instant payment confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Footer Buttons */}
          {!paymentDone && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#e9e7f4]">
              {currentStep > 1 ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleBack}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 10 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Save & Continue
                </Button>
              ) : null}
            </div>
          )}
        </main>
      </div>

      {/* AI SOP Review Modal (Side-by-Side View) */}
      {showSopModal && sopResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#17172b]/50 backdrop-blur-xs" onClick={() => setShowSopModal(false)} />
          <div className="relative bg-white rounded-[28px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto flex flex-col text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#e9e7f4]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#eeebff] text-[#7456ff] rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#17172b]">Gemini SOP Analysis & Feedback</h3>
                  <p className="text-xs text-[#77788b]">Objective evaluation for top Indian business schools</p>
                </div>
              </div>
              <Badge variant="lime" size="md">
                Clarity Score: {sopResult.clarityScore}/10
              </Badge>
            </div>

            <div className="my-6 space-y-6">
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider mb-2">
                    Key Strengths
                  </h4>
                  <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                    {sopResult.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider mb-2">
                    Areas for Refinement
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
                    {sopResult.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Side-by-Side: Original vs Improved */}
              <div>
                <h4 className="font-bold text-sm text-[#17172b] mb-2">Side-by-Side Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-[#e9e7f4] bg-[#f8f7ff]">
                    <span className="text-xs font-bold text-[#77788b] uppercase block mb-1">
                      Your Current Draft
                    </span>
                    <p className="text-xs text-[#17172b] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {profile.sop}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#7456ff]/40 bg-[#eeebff]/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[#7456ff] uppercase">
                        AI Recommended Version
                      </span>
                      <button
                        onClick={() => {
                          updateProfile((p) => ({ ...p, sop: sopResult.improvedVersion }));
                          showToast('Copied improved version to your form!', 'success');
                          setShowSopModal(false);
                        }}
                        className="text-xs font-bold text-[#7456ff] hover:underline"
                      >
                        Adopt This Version
                      </button>
                    </div>
                    <p className="text-xs text-[#17172b] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {sopResult.improvedVersion}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[#77788b] mt-2 italic">
                  Note: Admissions committees prize authenticity. Keep your own voice while adopting structure.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e9e7f4] flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setShowSopModal(false)}>
                Close Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
