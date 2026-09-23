"use client";

import React from 'react';

export default function StatsGrid({ isManager, requests = [], users = [], balances = [], currentUser }) {
  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : currentUser?.RoleId === 3 ? 'SYSTEM ADMINISTRATOR' : 'EMPLOYEE');
  const isSysAdmin = currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'ADMIN';

  if (isManager) {
    const myTeamUserIds = new Set(
      users.filter(u => u.ManagerId === currentUser?.UserId || u.UserId === currentUser?.UserId).map(u => u.UserId)
    );

    const filteredRequests = isSysAdmin
      ? requests
      : requests.filter(r => myTeamUserIds.has(r.UserId));

    const teamUsers = isSysAdmin
      ? users
      : users.filter(u => u.ManagerId === currentUser?.UserId);

    const pendingApprovalsCount = filteredRequests.filter(r => r.StatusId === 1).length;
    const totalUsers = teamUsers.length;
    const approvedCount = filteredRequests.filter(r => r.StatusId === 2).length;
    const totalRequests = filteredRequests.length;

    return (
      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-label">Pending Leaves</span>
          <span className="stats-value" style={{ color: '#ca8a04' }}>{pendingApprovalsCount} Requests</span>
          <span className="stats-sub">Awaiting action</span>
        </div>
        <div className="stats-card">
          <span className="stats-label">{isSysAdmin ? 'Active System Users' : 'Team Employees'}</span>
          <span className="stats-value" style={{ color: '#2563eb' }}>{totalUsers} {isSysAdmin ? 'Users' : 'Employees'}</span>
          <span className="stats-sub">{isSysAdmin ? `Total profiles: ${totalUsers}` : `Reporting to you: ${totalUsers}`}</span>
        </div>
        <div className="stats-card">
          <span className="stats-label">Approved This Year</span>
          <span className="stats-value" style={{ color: '#16a34a' }}>{approvedCount} Leaves</span>
          <span className="stats-sub">Total team requests: {totalRequests}</span>
        </div>
      </div>
    );
  }

  // Employee Calculations
  const userBalances = balances.filter(b => b.UserId === currentUser?.UserId && b.CalendarYearId === 1);
  const totalAllocated = userBalances.reduce((sum, b) => sum + b.AllocatedDays, 0);
  const totalUsed = userBalances.reduce((sum, b) => sum + b.UsedDays, 0);
  const totalAvailable = userBalances.reduce((sum, b) => sum + Math.max(0, b.AllocatedDays - b.UsedDays), 0);

  return (
    <div className="stats-grid">
      <div className="stats-card">
        <span className="stats-label">Total Leave Balance</span>
        <span className="stats-value" style={{ color: '#2563eb' }}>{totalAllocated} Days</span>
        <span className="stats-sub">Allocated for CY-2026</span>
      </div>
      <div className="stats-card">
        <span className="stats-label">Leaves Taken</span>
        <span className="stats-value" style={{ color: '#dc2626' }}>{totalUsed} Days</span>
        <span className="stats-sub">Used in current year</span>
      </div>
      <div className="stats-card">
        <span className="stats-label">Available Balance</span>
        <span className="stats-value" style={{ color: '#16a34a' }}>{totalAvailable} Days</span>
        <span className="stats-sub">Remaining entitlement</span>
      </div>
    </div>
  );
}
