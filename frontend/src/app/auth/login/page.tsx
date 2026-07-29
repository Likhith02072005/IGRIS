'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, hydrateAuth } from '../../../store/auth';

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
 const res = await fetch(`₹{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
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
 const mockEmail = `₹{provider}_user_₹{Math.floor(Math.random() * 1000)}@igris.lab`;
 const mockName = `₹{provider.toUpperCase()} Operator`;

 const res = await fetch(`₹{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/oauth`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: mockEmail,
 name: mockName,
 provider,
 providerUserId: `₹{provider}_123456`,
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
 <div className="min-h-screen w-full flex items-center justify-center px-4">
 <div className="w-full max-w-sm card border border-white/30 rounded-lg p-8">
 
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-[#fafafa]">IGRIS</h1>
 <p className="text-sm text-[#666] mt-1">Algorithmic Trading Platform</p>
 </div>

 {error && (
 <div className="mb-6 text-[#ef4444] text-sm">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm text-[#666] mb-1">
 Email
 </label>
 <input
 type="email"
 required
 className="w-full input-field bg-transparent border border-white/30 rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#22d3ee]"
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
 className="w-full input-field bg-transparent border border-white/30 rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none focus:border-[#22d3ee]"
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 disabled={loading}
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-2.5 px-4 rounded-lg bg-[#7c3aed] hover:bg-[#7c3aed]/90 text-black font-medium text-sm transition-colors disabled:opacity-50 mt-2"
 >
 {loading ? 'Signing in...' : 'Sign in'}
 </button>
 </form>

 <div className="my-6 flex items-center text-center">
 <div className="flex-1 border-t border-white/30"></div>
 <span className="px-3 text-xs text-[#666]">or continue with</span>
 <div className="flex-1 border-t border-white/30"></div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => handleSocialLogin('google')}
 disabled={loading}
 className="flex items-center justify-center py-2 px-4 rounded-lg bg-transparent border border-white/30 hover:bg-[#1a1a1a] text-sm text-[#fafafa] transition-colors"
 >
 Google
 </button>
 <button
 onClick={() => handleSocialLogin('github')}
 disabled={loading}
 className="flex items-center justify-center py-2 px-4 rounded-lg bg-transparent border border-white/30 hover:bg-[#1a1a1a] text-sm text-[#fafafa] transition-colors"
 >
 GitHub
 </button>
 </div>

 <p className="text-sm text-[#666] mt-8 text-center">
 Don&apos;t have an account?{' '}
 <Link href="/auth/register" className="text-[#7c3aed] hover:underline">
 Sign up
 </Link>
 </p>

 </div>
 </div>
 );
}
