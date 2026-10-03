import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface LegalPageProps {
  onNavigateHome: () => void;
}

export const TermsPage: React.FC<LegalPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans p-6 selection:bg-emerald-500/30 transition-colors">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeftOutlined className="text-xs" />
          <span>Back to Terminal</span>
        </button>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Last updated: September 29, 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono shadow-sm transition-colors">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Ratio Spread Terminal application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">2. Market Data & Financial Disclaimer</h2>
            <p>
              The options ratio spread matrix, greeks, payoff calculations, and market quotes displayed on this platform are for informational and analytical purposes only. Nothing on this website constitutes financial or investment advice. Options trading involves substantial risk of loss.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">3. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account login credentials and for all activities conducted under your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<LegalPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans p-6 selection:bg-emerald-500/30 transition-colors">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeftOutlined className="text-xs" />
          <span>Back to Terminal</span>
        </button>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Last updated: September 29, 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono shadow-sm transition-colors">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">1. Information Collection</h2>
            <p>
              We store user account emails, encrypted passwords, session tokens, and saved user strategy presets in a local lightweight persistent store.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">2. Broker API Credentials</h2>
            <p>
              Your Angel One SmartAPI credentials (API Key, Client Code, PIN, and TOTP Secret) are only transmitted over secure connections and can be saved to your session for real-time market data streaming.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">3. Cookies and Local Storage</h2>
            <p>
              We utilize local storage and secure HTTP headers solely for user authentication tokens and application theme preferences.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
