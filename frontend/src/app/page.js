"use client";

import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveContext } from '../context/LeaveContext';

export default function Home() {
  const router = useRouter();
  const { currentUser, loading } = useContext(LeaveContext);

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router]);

  return (
    <div style={{ padding: '24px', color: 'var(--text-medium)', fontSize: '0.9rem' }}>
      Redirecting...
    </div>
  );
}
