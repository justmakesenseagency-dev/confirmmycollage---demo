import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className="fixed bottom-20 lg:bottom-6 left-6 z-30 p-3 bg-white text-[#17172b] border border-[#e9e7f4] rounded-2xl shadow-lg hover:border-[#7456ff] hover:text-[#7456ff] hover:-translate-y-1 transition-all"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
