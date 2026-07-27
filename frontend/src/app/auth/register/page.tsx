'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, hydrateAuth } from '../../../store/auth';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm card bg-[#111111] border border-[#1a1a1a] rounded-lg p-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#fafafa]">Create Account</h1>
          <p className="text-sm text-[#666] mt-1">Join IGRIS Trading Platform</p>
        </div>

        {error && (
          <div className="mb-6 text-[#ef4444] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#666] mb-1">
              Name
            </label>
            <input
              type="text"
              required
              className="w-full input-field bg-transparent border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#22d3ee]"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full input-field bg-transparent border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#22d3ee]"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full input-field bg-transparent border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#22d3ee]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-black font-medium text-sm transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-[#666] mt-8 text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#22d3ee] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
