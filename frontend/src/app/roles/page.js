"use client";

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveContext } from '../../context/LeaveContext';
import LookupPanel from '../../components/LookupPanel';

export default function RolesPage() {
  const {
    currentUser,
    roles,
    saveLookup,
    handleDeleteLookup,
    loading
  } = useContext(LeaveContext);
  const router = useRouter();

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : currentUser?.RoleId === 3 ? 'SYSTEM ADMINISTRATOR' : 'EMPLOYEE');
  const isSystemAdmin = currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'SYSADMIN' || userRoleName === 'SYSTEM ADMIN';

  useEffect(() => {
    if (!loading && currentUser && !isSystemAdmin) {
      router.replace('/dashboard');
    }
  }, [currentUser, isSystemAdmin, loading, router]);

  if (loading || !currentUser || !isSystemAdmin) {
    return null;
  }

  const handleAdd = async () => {
    const name = prompt('Enter Role Name:');
    if (name) {
      const desc = prompt('Enter Role Description:');
      await saveLookup('roles', { RoleName: name, Description: desc });
    }
  };

  return (
    <LookupPanel
      type="roles"
      data={roles}
      onAdd={handleAdd}
      onDelete={handleDeleteLookup}
      getTitle={() => "Roles Management"}
    />
  );
}
