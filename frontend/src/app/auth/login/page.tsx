'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, hydrateAuth } from '../../../store/auth';
import { Shield, Mail, Lock, ArrowRight, Chrome, Github, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate auth state on mount
  useEffect(() => {
    hydrateAuth();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login.');
      }

      // Save user auth state in global Zustand store
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    try {
      // Direct mock integration for social oauth matching user requirements.
      // In production, this redirects to Google/Github consent screen, then back to callback.
      // We simulate the API callback success here.
      const mockEmail = `${provider}_user_${Math.floor(Math.random() * 1000)}@igris.lab`;
      const mockName = `${provider.toUpperCase()} Operator`;

      const res = await fetch('http://localhost:5001/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          name: mockName,
          provider,
          providerUserId: `${provider}_123456`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate via OAuth.');
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Social login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background Neon Glowing Rings */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-dark/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
        
        {/* Logo Headings */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-brand/10 border border-brand/20 mb-3 shadow-glass-inset">
            <Shield className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            Igris <span className="text-brand">Quant Lab</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Institutional Quantitative Research Platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-bloomberg-red/10 border border-bloomberg-red/30 text-bloomberg-red text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                className="w-full glass-input py-3 pl-11 pr-4 rounded-xl text-sm"
                placeholder="operator@igrisquant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                className="w-full glass-input py-3 pl-11 pr-4 rounded-xl text-sm"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center text-gray-400 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-gray-700 bg-gray-900 accent-brand" />
              Remember device
            </label>
            <a href="#" className="text-brand hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            {loading ? 'Authenticating Terminal...' : (
              <>
                Access Terminal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <span className="relative bg-[#0b0f1f]/80 px-3 text-xs text-gray-500 uppercase tracking-wider">
            Secure Federated Login
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-300 transition-all"
          >
            <Chrome className="w-4 h-4 text-red-500" />
            Google
          </button>
          <button
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-300 transition-all"
          >
            <Github className="w-4 h-4 text-white" />
            GitHub
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Need authorized access?{' '}
          <Link href="/auth/register" className="text-brand hover:underline font-semibold">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}
