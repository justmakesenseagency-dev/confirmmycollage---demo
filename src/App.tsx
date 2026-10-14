import React, { Suspense, lazy, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { ShortlistDrawer } from './components/layout/ShortlistDrawer';
import { CookieBanner } from './components/layout/CookieBanner';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { ChatbotWidget } from './components/layout/ChatbotWidget';
import { VibeCheckModal } from './components/home/VibeCheckModal';
import { useAuthStore } from './store/authStore';

// Lazy-loaded pages for fast initial bundle
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Explore = lazy(() => import('./pages/Explore').then((m) => ({ default: m.Explore })));
const CollegeDetail = lazy(() => import('./pages/CollegeDetail').then((m) => ({ default: m.CollegeDetail })));
const Compare = lazy(() => import('./pages/Compare').then((m) => ({ default: m.Compare })));
const ApplyWizard = lazy(() => import('./pages/ApplyWizard').then((m) => ({ default: m.ApplyWizard })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Questions = lazy(() => import('./pages/Questions').then((m) => ({ default: m.Questions })));
const QuestionPractice = lazy(() => import('./pages/QuestionPractice').then((m) => ({ default: m.QuestionPractice })));
const MockTest = lazy(() => import('./pages/MockTest').then((m) => ({ default: m.MockTest })));
const MockTestResult = lazy(() => import('./pages/MockTestResult').then((m) => ({ default: m.MockTestResult })));
const Scholarships = lazy(() => import('./pages/Scholarships').then((m) => ({ default: m.Scholarships })));
const Quiz = lazy(() => import('./pages/Quiz').then((m) => ({ default: m.Quiz })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })));
const Refund = lazy(() => import('./pages/Refund').then((m) => ({ default: m.Refund })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user?.isLoggedIn) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

// Page Title and Meta Synchronizer
const PageMetaHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'ConfirmMyCollege | Common Application Platform for Indian MBA/PGDM',
      '/explore': 'Explore B-Schools | ConfirmMyCollege',
      '/compare': 'Compare up to 5 B-Schools | ConfirmMyCollege',
      '/apply': 'Common Application Form | ConfirmMyCollege',
      '/dashboard': 'Application Tracker & Dashboard | ConfirmMyCollege',
      '/questions': 'Question Corner & Exam Prep | ConfirmMyCollege',
      '/questions/practice': 'Timed Practice Mode | ConfirmMyCollege',
      '/mock-test': 'Mini MBA Mock Test | ConfirmMyCollege',
      '/mock-test/result': 'Mock Test Scorecard & Solutions | ConfirmMyCollege',
      '/scholarships': 'MBA Scholarships & Fellowships | ConfirmMyCollege',
      '/quiz': 'AI College Recommender Quiz | ConfirmMyCollege',
      '/profile': 'Student Profile & Data Rights | ConfirmMyCollege',
      '/login': 'Student Login | ConfirmMyCollege',
      '/privacy': 'Privacy Policy (DPDP Act) | ConfirmMyCollege',
      '/terms': 'Terms of Service | ConfirmMyCollege',
      '/refund': 'Refund Policy | ConfirmMyCollege',
    };

    const currentTitle = titles[location.pathname] || 'ConfirmMyCollege';
    document.title = currentTitle;
  }, [location]);

  return null;
};

// Global Loading Fallback Skeleton
const PageLoader: React.FC = () => (
  <div className="max-w-[1180px] mx-auto px-5 py-24 flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-[#eeebff] border-2 border-[#7456ff] border-t-transparent animate-spin" />
    <span className="text-xs font-bold text-[#77788b]">Loading page...</span>
  </div>
);

export default function App() {
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [vibeCheckOpen, setVibeCheckOpen] = useState(false);

  return (
    <ToastProvider>
      <HashRouter>
        <PageMetaHandler />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#f8f7ff] text-[#17172b]">
          {/* Global Top Navbar */}
          <Navbar
            onOpenShortlist={() => setShortlistOpen(true)}
            onOpenVibeCheck={() => setVibeCheckOpen(true)}
          />

          {/* Main Routing Container with Safe Mobile Bottom Padding */}
          <div className="flex-1 pb-24 lg:pb-12">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/college/:id" element={<CollegeDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route
                  path="/apply"
                  element={
                    <ProtectedRoute>
                      <ApplyWizard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/questions" element={<Questions />} />
                <Route path="/questions/practice" element={<QuestionPractice />} />
                <Route path="/mock-test" element={<MockTest />} />
                <Route path="/mock-test/result" element={<MockTestResult />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<Refund />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>

          {/* Footer */}
          <Footer />

          {/* Mobile Bottom Tab Bar */}
          <BottomTabBar onOpenShortlist={() => setShortlistOpen(true)} />

          {/* Slide-out Shortlist Drawer */}
          <ShortlistDrawer
            isOpen={shortlistOpen}
            onClose={() => setShortlistOpen(false)}
          />

          {/* Gen-Z B-School Vibe Check & Aura Matcher Modal */}
          <VibeCheckModal
            isOpen={vibeCheckOpen}
            onClose={() => setVibeCheckOpen(false)}
          />

          {/* AI Admissions Chatbot Widget */}
          <ChatbotWidget />

          {/* Cookie & DPDP Consent Banner */}
          <CookieBanner />
        </div>
      </HashRouter>
    </ToastProvider>
  );
}
