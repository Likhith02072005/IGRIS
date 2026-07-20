'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, hydrateAuth } from '../../../store/auth';
import { User, Mail, Lock, ShieldAlert, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrateAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-dark/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Panel */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-brand/10 border border-brand/20 mb-3 shadow-glass-inset">
            <UserPlus className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            Igris <span className="text-brand">Quant Lab</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Terminal Provisioning Console</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-bloomberg-red/10 border border-bloomberg-red/30 text-bloomberg-red text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Full Name / Operator ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                className="w-full glass-input py-3 pl-11 pr-4 rounded-xl text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Secure Email Address
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
              Terminal Access Password
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

          <div className="flex items-start gap-2.5 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <span>I authorize credentials encryption and terms of service.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            {loading ? 'Provisioning Account...' : (
              <>
                Create Terminal Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Already authorized?{' '}
          <Link href="/auth/login" className="text-brand hover:underline font-semibold">
            Access Terminal
          </Link>
        </p>

      </div>
    </div>
  );
}
