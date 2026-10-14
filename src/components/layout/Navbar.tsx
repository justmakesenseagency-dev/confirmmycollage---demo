import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, Sparkles, Zap, Flame, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useShortlistStore } from '../../store/shortlistStore';
import { SoundFX } from '../../utils/sound';

interface NavbarProps {
  onOpenShortlist: () => void;
  onOpenVibeCheck?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortlist, onOpenVibeCheck }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { shortlist } = useShortlistStore();

  const navLinks = [
    { label: 'Explore', path: '/explore' },
    { label: 'Compare', path: '/compare' },
    { label: 'Apply', path: '/apply' },
    { label: 'Question Corner', path: '/questions' },
    { label: 'Mock Test', path: '/mock-test' },
    { label: 'Scholarships', path: '/scholarships' },
    { label: 'Quiz', path: '/quiz' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#17172b]/10 transition-all">
      {/* Top micro announcement strip */}
      <div className="bg-[#17172b] text-white py-1 px-4 text-center text-[11px] font-bold tracking-wide flex items-center justify-center gap-2">
        <span className="bg-[#d9ff64] text-[#17172b] px-2 py-0.2 rounded-full text-[10px] uppercase font-extrabold flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 fill-current" /> No Cap
        </span>
        <span className="truncate">Apply to 5 Top B-Schools with 1 Common Form & 1 Fee. Save ₹6,000+!</span>
        <Link to="/apply" className="underline text-[#d9ff64] hover:text-white shrink-0 ml-1">
          Apply Now →
        </Link>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-7 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo with Gen Z Neo-pop Tilt */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-[38px] h-[38px] bg-[#7456ff] rounded-xl -rotate-6 flex items-center justify-center shadow-[2px_2px_0px_#17172b] border border-[#17172b] group-hover:rotate-0 transition-transform">
            <span className="text-white font-extrabold text-xl tracking-tight">C</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg sm:text-2xl text-[#17172b] tracking-tight leading-none">
              ConfirmMy<span className="text-[#7456ff]">College</span>
            </span>
            <span className="text-[10px] font-bold text-[#77788b] tracking-wider uppercase mt-0.5">
              1 Form • 5 B-Schools ⚡
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive(link.path)
                  ? 'text-[#17172b] bg-[#d9ff64] border border-[#17172b] pop-shadow-sm'
                  : 'text-[#77788b] hover:text-[#17172b] hover:bg-[#eeebff]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions / User Area */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              SoundFX.toggle();
              // force re-render
              setMobileMenuOpen((v) => v);
            }}
            title={SoundFX.isEnabled() ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle sound FX"
            className="p-2.5 rounded-xl border border-[#17172b]/20 hover:border-[#17172b] bg-white text-[#17172b] pop-shadow-sm hover:bg-[#eeebff] transition-all cursor-pointer"
          >
            {SoundFX.isEnabled() ? (
              <Volume2 className="w-4 h-4 text-[#7456ff]" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Vibe Check Button */}
          {onOpenVibeCheck && (
            <button
              onClick={() => {
                SoundFX.pop();
                onOpenVibeCheck();
              }}
              className="px-3 py-2 rounded-xl border border-[#17172b] bg-[#d9ff64] text-[#17172b] font-black text-xs pop-shadow-sm hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7456ff]" />
              <span className="hidden md:inline">Vibe Check</span>
              <span className="md:hidden">Vibe</span>
            </button>
          )}

          {/* Shortlist Heart Button */}
          <button
            onClick={() => {
              SoundFX.tick();
              onOpenShortlist();
            }}
            aria-label="View shortlisted colleges"
            className="relative p-2.5 rounded-xl border border-[#17172b]/20 hover:border-[#17172b] bg-white text-[#17172b] pop-shadow-sm hover:bg-[#eeebff] transition-all cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${shortlist.length > 0 ? 'fill-[#ff8dc7] text-[#ff8dc7]' : ''}`} />
            {shortlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#7456ff] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {shortlist.length}
              </span>
            )}
          </button>

          {user?.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" onClick={() => SoundFX.pop()}>
                <Button variant="secondary" size="sm" icon={<User className="w-4 h-4" />}>
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={() => {
                  SoundFX.tick();
                  logout();
                }}
                title="Log out"
                aria-label="Log out"
                className="p-2.5 rounded-xl text-[#77788b] hover:text-[#e5484d] hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" onClick={() => SoundFX.pop()}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/apply" onClick={() => SoundFX.pop()}>
                <Button
                  variant="primary"
                  size="sm"
                  className="pop-shadow !bg-[#7456ff] border border-[#17172b]"
                  icon={<Sparkles className="w-4 h-4 text-[#d9ff64]" />}
                >
                  Apply 🚀
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Shortlist */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={onOpenShortlist}
            aria-label="Shortlist"
            className="relative p-2 text-[#17172b] border border-[#17172b]/20 rounded-xl"
          >
            <Heart className={`w-5 h-5 ${shortlist.length > 0 ? 'fill-[#ff8dc7] text-[#ff8dc7]' : ''}`} />
            {shortlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7456ff] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {shortlist.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl border border-[#17172b]/20 text-[#17172b] hover:bg-[#eeebff]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-[#17172b] px-6 py-5 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-between ${
                isActive(link.path)
                  ? 'bg-[#d9ff64] text-[#17172b] border border-[#17172b]'
                  : 'text-[#17172b] hover:bg-[#f8f7ff]'
              }`}
            >
              <span>{link.label}</span>
              <span className="text-xs text-gray-400">→</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-[#e9e7f4] flex flex-col gap-2">
            {/* Mobile Vibe Check & Sound FX row */}
            <div className="flex items-center gap-2 mb-1">
              {onOpenVibeCheck && (
                <button
                  onClick={() => {
                    SoundFX.pop();
                    setMobileMenuOpen(false);
                    onOpenVibeCheck();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#17172b] bg-[#d9ff64] text-[#17172b] font-black text-xs pop-shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#7456ff]" />
                  <span>Take B-School Vibe Check ✨</span>
                </button>
              )}
              <button
                onClick={() => {
                  SoundFX.toggle();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-[#17172b]/20 bg-[#f8f7ff] text-[#17172b] flex items-center justify-center text-xs font-bold gap-1"
              >
                {SoundFX.isEnabled() ? (
                  <Volume2 className="w-4 h-4 text-[#7456ff]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {user?.isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => {
                    SoundFX.pop();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-[#eeebff] text-[#7456ff] font-bold rounded-xl border border-[#7456ff]/30"
                >
                  My Dashboard 🚀
                </Link>
                <button
                  onClick={() => {
                    SoundFX.tick();
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-[#e5484d] font-bold text-xs"
                >
                  Log out ({user.fullName})
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => {
                    SoundFX.pop();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 border border-[#17172b] font-bold rounded-xl text-sm"
                >
                  Log In / Student Account
                </Link>
                <Link
                  to="/apply"
                  onClick={() => {
                    SoundFX.pop();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 bg-[#7456ff] text-white font-bold rounded-xl border border-[#17172b] pop-shadow-sm text-sm"
                >
                  Start Common Application ⚡
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
