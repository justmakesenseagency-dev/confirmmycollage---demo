/**
 * Validation utilities for ConfirmMyCollege Common Application Form
 */

export const Validators = {
  isValidName(name: string): boolean {
    return typeof name === 'string' && name.trim().length >= 3;
  },

  isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  isValidIndianPhone(phone: string): boolean {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone.trim().replace(/\s+/g, ''));
  },

  isValidPincode(pincode: string): boolean {
    const re = /^\d{6}$/;
    return re.test(pincode.trim());
  },

  calculateAge(dobString: string): number {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 0;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  },

  isEligibleAge(dobString: string): boolean {
    const age = this.calculateAge(dobString);
    return age >= 20 && age <= 35;
  },

  isValidPercentage(val: number | string): boolean {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return !isNaN(num) && num >= 0 && num <= 100;
  },

  cgpaToPercentage(cgpa: number): number {
    return parseFloat((cgpa * 9.5).toFixed(2));
  },

  countWords(text: string): number {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  },

  getSopState(wordCount: number): 'too-short' | 'in-range' | 'too-long' {
    if (wordCount < 300) return 'too-short';
    if (wordCount <= 500) return 'in-range';
    return 'too-long';
  },

  calculateWorkExperienceMonths(
    entries: { fromMonth: string; toMonth: string }[]
  ): number {
    let totalMonths = 0;
    entries.forEach(({ fromMonth, toMonth }) => {
      if (!fromMonth || !toMonth) return;
      const [y1, m1] = fromMonth.split('-').map(Number);
      const [y2, m2] = toMonth.split('-').map(Number);
      if (y1 && m1 && y2 && m2) {
        const months = (y2 - y1) * 12 + (m2 - m1) + 1;
        if (months > 0) totalMonths += months;
      }
    });
    return totalMonths;
  },
};
