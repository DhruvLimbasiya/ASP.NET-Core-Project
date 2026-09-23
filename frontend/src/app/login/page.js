"use client";

import React, { useContext, useEffect } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { currentUser } = useContext(LeaveContext);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  return null; // AppLayout renders the login form when !currentUser
}
