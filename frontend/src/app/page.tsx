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
    <div className="min-h-screen w-full flex items-center justify-center  text-[#666]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#22d3ee] mx-auto mb-4" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );
}
