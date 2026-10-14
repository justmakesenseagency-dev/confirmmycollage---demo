import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, User, Sparkles } from 'lucide-react';
import { useShortlistStore } from '../../store/shortlistStore';
import { useAuthStore } from '../../store/authStore';
import { SoundFX } from '../../utils/sound';

interface BottomTabBarProps {
  onOpenShortlist: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ onOpenShortlist }) => {
  const location = useLocation();
  const { shortlist } = useShortlistStore();
  const { user } = useAuthStore();

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#17172b]/10 px-3 py-1.5 flex items-center justify-around shadow-[0_-8px_24px_rgba(23,23,43,0.08)] pb-safe"
    >
      {/* Home */}
      <Link
        to="/"
        onClick={() => SoundFX.pop()}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
          isTabActive('/')
            ? 'text-[#17172b] bg-[#d9ff64] border border-[#17172b] pop-shadow-sm font-extrabold scale-105'
            : 'text-[#77788b]'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Home</span>
      </Link>

      {/* Explore */}
      <Link
        to="/explore"
        onClick={() => SoundFX.pop()}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
          isTabActive('/explore')
            ? 'text-[#17172b] bg-[#d9ff64] border border-[#17172b] pop-shadow-sm font-extrabold scale-105'
            : 'text-[#77788b]'
        }`}
      >
        <Compass className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Explore</span>
      </Link>

      {/* Apply Fast Button */}
      <Link
        to="/apply"
        onClick={() => SoundFX.pop()}
        className="flex flex-col items-center -mt-4 bg-[#7456ff] text-white p-2.5 rounded-full border-2 border-[#17172b] pop-shadow transition-transform active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-[#d9ff64]" />
        <span className="text-[9px] font-extrabold tracking-tighter">Apply</span>
      </Link>

      {/* Shortlist */}
      <button
        onClick={() => {
          SoundFX.tick();
          onOpenShortlist();
        }}
        className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all text-[#77788b] relative cursor-pointer"
      >
        <div className="relative">
          <Heart className={`w-4 h-4 ${shortlist.length > 0 ? 'fill-[#ff8dc7] text-[#ff8dc7]' : ''}`} />
          {shortlist.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#7456ff] text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
              {shortlist.length}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">Shortlist</span>
      </button>

      {/* Profile / Dashboard */}
      <Link
        to={user?.isLoggedIn ? '/dashboard' : '/login'}
        onClick={() => SoundFX.pop()}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
          isTabActive('/dashboard') || isTabActive('/profile') || isTabActive('/login')
            ? 'text-[#17172b] bg-[#d9ff64] border border-[#17172b] pop-shadow-sm font-extrabold scale-105'
            : 'text-[#77788b]'
        }`}
      >
        <User className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">
          {user?.isLoggedIn ? 'Dashboard' : 'Account'}
        </span>
      </Link>
    </nav>
  );
};
