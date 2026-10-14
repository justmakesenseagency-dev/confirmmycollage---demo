import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Validators } from '../services/validators';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { SoundFX } from '../utils/sound';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const { login } = useAuthStore();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('Rahul Sharma');
  const [email, setEmail] = useState('rahul.sharma@example.com');
  const [phone, setPhone] = useState('9876543210');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Validators.isValidName(fullName)) {
      setError('Please provide your full legal name (min 3 characters).');
      return;
    }
    if (!Validators.isValidEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!Validators.isValidIndianPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setError('');
    setOtpStep(true);
    SoundFX.pop();
    showToast('Demo OTP generated: Enter any 6-digit code (e.g. 123456)', 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the 6-digit Demo OTP.');
      return;
    }

    SoundFX.success();
    login({ fullName, email, phone });
    showToast(`Welcome to ConfirmMyCollege, ${fullName}!`, 'success');
    navigate(returnUrl);
  };

  return (
    <div className="max-w-[480px] mx-auto px-5 py-12 text-left">
      <div className="bg-white rounded-[28px] border border-[#e9e7f4] p-8 sm:p-10 shadow-[0_16px_40px_rgba(33,25,76,0.06)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7456ff] rounded-2xl -rotate-6 flex items-center justify-center mx-auto shadow-md">
            <span className="text-white font-extrabold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-[#17172b]">
            {otpStep ? 'Verify Demo OTP' : 'Student Login / Sign Up'}
          </h1>
          <p className="text-xs text-[#77788b]">
            {otpStep
              ? 'Enter any 6-digit code to complete authentication.'
              : 'Access your saved application drafts and admission tracking dashboard.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {!otpStep ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="rahul.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Mobile Number (10 digits)"
              required
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="pt-2">
              <Button variant="primary" size="lg" className="w-full" type="submit">
                Get Verification Code →
              </Button>
            </div>

            <p className="text-[11px] text-[#77788b] text-center">
              DEMO AUTH: No real SMS is sent. Pre-filled sample data is ready to use.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#17172b] block mb-1">
                Enter 6-Digit Demo OTP
              </label>
              <input
                type="text"
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 text-center tracking-widest text-lg font-bold rounded-xl border border-[#7456ff]/40 bg-[#f8f7ff] outline-none focus:ring-4 focus:ring-[#7456ff]/20"
              />
              <span className="text-[11px] text-[#7456ff] block mt-1.5 text-center font-medium">
                (Any 6 digits will authenticate in demo mode)
              </span>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="lg" className="w-full" type="submit">
                Confirm & Enter Dashboard
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setOtpStep(false)}
              className="w-full text-xs text-gray-500 hover:underline text-center block pt-2"
            >
              ← Edit mobile number or details
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#e9e7f4] flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Aligned with DPDP Act 2023 Principles</span>
        </div>
      </div>
    </div>
  );
};
