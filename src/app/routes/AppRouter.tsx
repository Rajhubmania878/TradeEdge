import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { initializeUniverseData } from '@/data/universeManager';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { LoadingScreen } from '@/shared/components/feedback/LoadingScreen';
import { MainTerminalPage } from '@/pages/terminal/MainTerminalPage';

// Code-split pages for instant initial load and minimal bundle footprint
const LandingPage = React.lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const TermsPage = React.lazy(() => import('@/pages/auth/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = React.lazy(() => import('@/pages/auth/TermsPage').then(m => ({ default: m.PrivacyPage })));

export const AppRouter: React.FC = () => {
  const { currentUser, setCurrentUser, viewMode, setViewMode, isUniverseLoaded, setIsUniverseLoaded } = useAuth();

  // Load dynamic universes when entering terminal workspace
  React.useEffect(() => {
    if (viewMode === 'APP') {
      initializeUniverseData()
        .then(() => setIsUniverseLoaded(true))
        .catch((err) => {
          console.error('[AppRouter] Failed to load trading universe:', err);
        });
    }
  }, [viewMode, setIsUniverseLoaded]);

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen mode="page" />}>
        {viewMode === 'LANDING' && (
          <LandingPage
            onNavigateLogin={() => setViewMode('LOGIN')}
            onNavigateSignup={() => setViewMode('SIGNUP')}
            onNavigateTerms={() => setViewMode('TERMS')}
            onNavigatePrivacy={() => setViewMode('PRIVACY')}
          />
        )}

      {viewMode === 'LOGIN' && (
        <LoginPage
          onLoginSuccess={user => {
            setCurrentUser(user);
            setViewMode('APP');
          }}
          onNavigateSignup={() => setViewMode('SIGNUP')}
          onNavigateForgotPassword={() => setViewMode('FORGOT_PASSWORD')}
          onNavigateHome={() => setViewMode('LANDING')}
        />
      )}

      {viewMode === 'SIGNUP' && (
        <SignupPage
          onNavigateLogin={() => setViewMode('LOGIN')}
          onNavigateTerms={() => setViewMode('TERMS')}
          onNavigatePrivacy={() => setViewMode('PRIVACY')}
          onNavigateHome={() => setViewMode('LANDING')}
        />
      )}

      {viewMode === 'FORGOT_PASSWORD' && (
        <ForgotPasswordPage
          onNavigateLogin={() => setViewMode('LOGIN')}
          onNavigateHome={() => setViewMode('LANDING')}
        />
      )}

      {viewMode === 'TERMS' && (
        <TermsPage onNavigateHome={() => setViewMode(currentUser ? 'APP' : 'LANDING')} />
      )}

      {viewMode === 'PRIVACY' && (
        <PrivacyPage onNavigateHome={() => setViewMode(currentUser ? 'APP' : 'LANDING')} />
      )}

      {viewMode === 'APP' && (
        currentUser ? (
          isUniverseLoaded ? (
            <MainTerminalPage />
          ) : (
            <LoadingScreen mode="page" tip="Synchronizing Equity & Options Contract Universe..." />
          )
        ) : (
          <LoginPage
            onLoginSuccess={user => {
              setCurrentUser(user);
              setViewMode('APP');
            }}
            onNavigateSignup={() => setViewMode('SIGNUP')}
            onNavigateForgotPassword={() => setViewMode('FORGOT_PASSWORD')}
            onNavigateHome={() => setViewMode('LANDING')}
          />
        )
      )}
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
