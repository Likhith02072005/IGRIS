'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, hydrateAuth } from '../store/auth';

export default function EntryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrateAuth();
    if (useAuthStore.getState().isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-gray-400">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-sm tracking-widest uppercase">Initializing Astra Quant Lab Terminal...</p>
      </div>
    </div>
  );
}
