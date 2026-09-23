"use client";

import React, { useContext } from 'react';
import { LeaveContext } from '../../context/LeaveContext';

export default function Balances() {
  const {
    currentUser,
    balances,
    leaveTypes,
    getLeaveTypeName
  } = useContext(LeaveContext);

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : 'EMPLOYEE');
  const isManager = userRoleName === 'MANAGER' || userRoleName === 'ADMIN' || userRoleName === 'SYSTEM ADMINISTRATOR';

  if (isManager) {
    return (
      <div style={{ padding: '24px', color: 'var(--text-medium)' }}>
        Managers do not have leave balances.
      </div>
    );
  }

  const categoryList = leaveTypes.map(lt => {
    const b = balances.find(bal => bal.UserId === currentUser?.UserId && bal.LeaveTypeId === lt.LeaveTypeId && bal.CalendarYearId === 1) || {
      AllocatedDays: lt.DefaultDays || 10,
      UsedDays: 0
    };
    return {
      id: lt.LeaveTypeId,
      name: lt.TypeName || getLeaveTypeName(lt.LeaveTypeId),
      allocated: b.AllocatedDays,
      used: b.UsedDays,
      remaining: Math.max(0, b.AllocatedDays - b.UsedDays)
    };
  });

  return (
    <div className="panel-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="panel-header">
        <h3 className="panel-title">My Leave Balances</h3>
      </div>
      <div style={{ padding: '32px' }}>
        <div className="stats-grid">
          {categoryList.map(item => (
            <div className="stats-card" key={item.id}>
              <span className="stats-label">{item.name}</span>
              <span className="stats-value">{item.remaining} Days</span>
              <span className="stats-sub">Used: {item.used} / Allocated: {item.allocated}</span>
            </div>
          ))}
        </div>

        {categoryList.length === 0 && (
          <div style={{ color: 'var(--text-medium)', fontSize: '0.9rem', textAlign: 'center', padding: '32px' }}>
            No leave categories available for this calendar year.
          </div>
        )}
      </div>
    </div>
  );
}
