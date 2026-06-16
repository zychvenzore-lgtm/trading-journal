/**
 * ============================================================
 * LOGIN PAGE — Full-screen dark login with Google OAuth
 * Features animated gradient background and glassmorphic card.
 * ============================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Helper to calculate password strength (0: Weak, 1: Medium, 2: Strong)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (pass.length > 10 && /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  /* ---- Redirect if already logged in or handle URL params ---- */
  useEffect(() => {
    if (user) router.replace('/dashboard');
    
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('mode') === 'signup') {
        setIsSignUp(true);
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError(t('login.passwordsNoMatch'));
        setLoading(false);
        return;
      }
      if (getPasswordStrength(password) === 0) {
        setError(t('login.passwordTooWeak'));
        setLoading(false);
        return;
      }
    }

    let authError: any = null;
    let authData: any = null;

    if (isSignUp) {
      const res = await signUpWithEmail(email, password, username);
      authError = res.error;
      authData = res.data;
    } else {
      const res = await signInWithEmail(email, password);
      authError = res.error;
    }

    if (authError) {
      setError(authError.message || JSON.stringify(authError));
      setLoading(false);
    } else {
      if (isSignUp && authData?.session === null) {
        // Successful signup, but requires email confirmation
        setSuccessMessage(t('login.accountCreated'));
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
        setIsSignUp(false);
        setLoading(false);
      }
      // If session exists or it was a login, useEffect handles redirect
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-base-900 overflow-hidden">
      {/* ---- Animated gradient background orbs ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blue orb — top right */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle, #007BFF 0%, transparent 70%)',
          }}
        />
        {/* Red orb — bottom left */}
        <div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-15 animate-float-reverse"
          style={{
            background: 'radial-gradient(circle, #D90429 0%, transparent 70%)',
          }}
        />
        {/* Cyan orb — center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)',
          }}
        />
      </div>


      {/* ---- Grid lines overlay ---- */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ---- Login Card ---- */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="glass rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            {/* Chart icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6 animate-pulse-glow">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-text-primary">
              {t('login.title').replace('Vault', '')}<span className="text-accent">Vault</span>
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-base-600" />
            <span className="text-text-muted text-xs uppercase tracking-widest">
              {t('login.signInToContinue')}
            </span>
            <div className="flex-1 h-px bg-base-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                type="text"
                placeholder={t('login.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
              />
            )}
            <Input
              type="email"
              placeholder={t('login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {isSignUp && password && (
              <div className="space-y-1 mt-1">
                <div className="flex gap-1 h-1.5 w-full">
                  <div className={`h-full flex-1 rounded-full ${getPasswordStrength(password) >= 0 ? (getPasswordStrength(password) === 0 ? 'bg-danger' : getPasswordStrength(password) === 1 ? 'bg-warning' : 'bg-success') : 'bg-base-600'}`} />
                  <div className={`h-full flex-1 rounded-full ${getPasswordStrength(password) >= 1 ? (getPasswordStrength(password) === 1 ? 'bg-warning' : 'bg-success') : 'bg-base-600'}`} />
                  <div className={`h-full flex-1 rounded-full ${getPasswordStrength(password) >= 2 ? 'bg-success' : 'bg-base-600'}`} />
                </div>
                <p className="text-xs text-text-muted text-right">
                  {getPasswordStrength(password) === 0 && t('login.weak')}
                  {getPasswordStrength(password) === 1 && t('login.medium')}
                  {getPasswordStrength(password) === 2 && t('login.strong')}
                </p>
              </div>
            )}

            {isSignUp && (
              <Input
                type="password"
                placeholder={t('login.reEnterPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isSignUp}
              />
            )}
            
            {error && <p className="text-sm text-danger">{error}</p>}
            {successMessage && <p className="text-sm text-success">{successMessage}</p>}
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              {isSignUp ? t('login.createAccount') : t('login.signIn')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-accent hover:text-accent-light transition-colors"
            >
              {isSignUp ? t('login.haveAccount') : t('login.noAccount')}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-text-muted text-xs mt-6 leading-relaxed">
            {t('login.termsFooter')}
            <br />
            {t('login.termsFooter2')}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="mt-6 flex justify-center">
          <div className="w-20 h-1 rounded-full bg-gradient-to-r from-accent to-accent-light opacity-60" />
        </div>
      </div>

    </div>
  );
}
