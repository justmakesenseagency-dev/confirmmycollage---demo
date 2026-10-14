import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-[600px] mx-auto px-5 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-[#eeebff] text-[#7456ff] flex items-center justify-center mx-auto shadow-md">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#7456ff] uppercase tracking-wider">Error 404</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#17172b]">
          Oops! Page Not Found
        </h1>
        <p className="text-sm text-[#77788b] max-w-sm mx-auto">
          The link you followed might be broken or the college page has been reorganized.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <Link to="/">
          <Button variant="primary">Return to Homepage</Button>
        </Link>
        <Link to="/explore">
          <Button variant="secondary">Browse Colleges</Button>
        </Link>
      </div>
    </div>
  );
};
