"use client";

import React, { useContext } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import StatsGrid from '../../components/StatsGrid';
import { CheckSquare, Plus, UserCheck, Check } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const {
    currentUser,
    users,
    requests,
    balances,
    leaveTypes,
    approveUserAccount,
    getUserName,
    getLeaveTypeName,
    getStatusBadgeClass,
    getStatusName,
    setShowRequestModal,
    setShowApprovalModal,
    setSelectedRequestForApproval
  } = useContext(LeaveContext);

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : currentUser?.RoleId === 3 ? 'SYSTEM ADMINISTRATOR' : 'EMPLOYEE');
  const isSysAdmin = currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'ADMIN';
  const isManager = userRoleName === 'MANAGER' || isSysAdmin;

  const myTeamUserIds = new Set(
    users.filter(u => u.ManagerId === currentUser?.UserId || u.UserId === currentUser?.UserId).map(u => u.UserId)
  );

  const displayRequests = isSysAdmin
    ? requests
    : isManager
    ? requests.filter(r => myTeamUserIds.has(r.UserId))
    : requests.filter(r => r.UserId === currentUser?.UserId);

  const pendingApprovalsCount = displayRequests.filter(r => r.StatusId === 1).length;

  const pendingUserApprovals = users.filter(u => {
    if (u.IsActive) return false;
    if (isSysAdmin) return u.RoleId === 1 || u.RoleId === 2; // SysAdmin approves Managers & Employees
    if (isManager) {
      // Manager approves ONLY Employees assigned to them
      return u.RoleId === 2 && u.ManagerId === currentUser?.UserId;
    }
    return false;
  });

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {currentUser?.FirstName}!</h1>
          <p>
            {isManager
              ? 'Review pending employee leaves, configure leave rules, and manage user accounts.'
              : 'Plan your time off, track your leave balances, and view request statuses.'}
          </p>
        </div>
        <div>
          {isManager ? (
            <Link
              href="/requests"
              className="btn btn-primary"
              style={{ background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <CheckSquare size={16} />
              Pending Approvals ({pendingApprovalsCount})
            </Link>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setShowRequestModal(true)}
              style={{ background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Request Leave
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsGrid
        isManager={isManager}
        requests={requests}
        users={users}
        balances={balances}
        currentUser={currentUser}
      />

      {/* Pending User Account Registration Approvals */}
      {isManager && pendingUserApprovals.length > 0 && (
        <div className="panel-card" style={{ marginTop: '24px', border: '1px solid #bfdbfe' }}>
          <div className="panel-header" style={{ backgroundColor: '#eff6ff' }}>
            <h3 className="panel-title" style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} />
              Pending Account Registration Approvals ({pendingUserApprovals.length})
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Company & Team</th>
                  <th>Requested Role</th>
                  <th>Assigned Manager</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUserApprovals.map(u => {
                  const assignedManager = users.find(m => m.UserId === u.ManagerId);
                  return (
                    <tr key={u.UserId}>
                      <td style={{ fontWeight: 700 }}>{u.FirstName} {u.LastName}</td>
                      <td>{u.Email}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.CompanyName || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>{u.TeamName || 'N/A'}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: u.RoleId === 1 ? '#e0e7ff' : '#f3f4f6', color: u.RoleId === 1 ? '#3730a3' : '#374151' }}>
                          {u.Role?.RoleName || (u.RoleId === 1 ? 'Manager' : 'Employee')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {assignedManager ? (
                          <span style={{ fontWeight: 600, color: '#1e40af' }}>
                            {assignedManager.FirstName} {assignedManager.LastName}
                          </span>
                        ) : u.RoleId === 1 ? (
                          <span style={{ color: '#6b7280' }}>N/A (Manager)</span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-pending">Pending Approval</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            padding: '5px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={async () => {
                            const ok = await approveUserAccount(u.UserId);
                            if (ok) {
                              alert(`Account for ${u.FirstName} ${u.LastName} has been approved!`);
                            }
                          }}
                        >
                          <Check size={14} />
                          Approve Account
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: isManager ? '1fr' : '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Leave Balances Summary (Employee only) */}
        {!isManager && (
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">My Leave Balances</h3>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
              {leaveTypes.map(lt => {
                const b = balances.find(bal => bal.UserId === currentUser?.UserId && bal.LeaveTypeId === lt.LeaveTypeId && bal.CalendarYearId === 1) || {
                  BalanceId: `lt-${lt.LeaveTypeId}`,
                  AllocatedDays: lt.DefaultDays || 10,
                  UsedDays: 0
                };
                const name = lt.TypeName || getLeaveTypeName(lt.LeaveTypeId);
                const remaining = Math.max(0, b.AllocatedDays - b.UsedDays);
                const percentage = b.AllocatedDays > 0 ? Math.min(100, Math.max(0, (remaining / b.AllocatedDays) * 100)) : 0;
                
                let barGradient = 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
                let dotColor = '#3b82f6';

                if (name.toLowerCase().includes('annual')) {
                  barGradient = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
                  dotColor = '#10b981';
                } else if (name.toLowerCase().includes('sick')) {
                  barGradient = 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)';
                  dotColor = '#6366f1';
                } else if (name.toLowerCase().includes('casual')) {
                  barGradient = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
                  dotColor = '#f59e0b';
                } else if (name.toLowerCase().includes('maternity') || name.toLowerCase().includes('paternity')) {
                  barGradient = 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)';
                  dotColor = '#ec4899';
                } else if (name.toLowerCase().includes('unpaid') || name.toLowerCase().includes('loss')) {
                  barGradient = 'linear-gradient(90deg, #6b7280 0%, #4b5563 100%)';
                  dotColor = '#6b7280';
                }

                return (
                  <div key={lt.LeaveTypeId} className="balance-item">
                    <div className="balance-item-header">
                      <div className="balance-name">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }} />
                        {name}
                      </div>
                      <div className="balance-count">
                        <span>{remaining}</span> / {b.AllocatedDays} Days Left
                      </div>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percentage}%`,
                          background: barGradient,
                          boxShadow: `0 2px 4px ${dotColor}40`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {leaveTypes.length === 0 && (
                <div style={{ color: 'var(--text-medium)', fontSize: '0.9rem', textAlign: 'center' }}>
                  No leave categories available.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Leave Requests */}
        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title">Recent Leave Requests</h3>
            <Link href="/requests" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  {isManager && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  {isManager && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayRequests.slice(0, 5).map(r => (
                  <tr key={r.RequestId}>
                    {isManager && (
                      <td style={{ fontWeight: 700 }}>{getUserName(r.UserId)}</td>
                    )}
                    <td>{getLeaveTypeName(r.LeaveTypeId)}</td>
                    <td>
                      {new Date(r.StartDate).toLocaleDateString()} - {new Date(r.EndDate).toLocaleDateString()}
                    </td>
                    <td>{r.TotalDays}</td>
                    <td>
                      <span className={getStatusBadgeClass(r.StatusId)}>
                        {getStatusName(r.StatusId)}
                      </span>
                    </td>
                    {isManager && (
                      <td>
                        {r.StatusId === 1 ? (
                          <button
                            className="btn btn-outline"
                            onClick={() => {
                              setSelectedRequestForApproval(r);
                              setShowApprovalModal(true);
                            }}
                          >
                            Review
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Reviewed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}

                {displayRequests.length === 0 && (
                  <tr>
                    <td colSpan={isManager ? 6 : 4} style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '32px' }}>
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
