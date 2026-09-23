"use client";

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveContext } from '../../context/LeaveContext';
import { UserCheck, Users, Search, CheckCircle, Clock, ShieldCheck, ChevronLeft, ChevronRight, AlertCircle, Building2, Briefcase, UserCog } from 'lucide-react';

export default function ManagersPage() {
  const {
    currentUser,
    users,
    fetchPagedUsers,
    approveUserAccount,
    deleteLookup,
    loading: contextLoading
  } = useContext(LeaveContext);
  const router = useRouter();

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : currentUser?.RoleId === 3 ? 'SYSTEM ADMINISTRATOR' : 'EMPLOYEE');
  const isSystemAdmin = currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'SYSADMIN' || userRoleName === 'SYSTEM ADMIN';

  const [pagedData, setPagedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, PENDING
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [actionLoading, setActionLoading] = useState(null);

  // Guard: Redirect non-system admins to dashboard
  useEffect(() => {
    if (!contextLoading && currentUser && !isSystemAdmin) {
      router.replace('/dashboard');
    }
  }, [contextLoading, currentUser, isSystemAdmin, router]);

  const loadManagers = useCallback(async () => {
    if (!currentUser || !isSystemAdmin) return;
    setLoading(true);

    const params = {
      pageNumber,
      pageSize,
      search,
      roleId: 1 // Manager Role
    };

    const res = await fetchPagedUsers(params);
    setPagedData(res);
    setLoading(false);
  }, [currentUser, fetchPagedUsers, isSystemAdmin, pageNumber, pageSize, search]);

  useEffect(() => {
    if (isSystemAdmin) {
      loadManagers();
    }
  }, [isSystemAdmin, loadManagers]);

  if (contextLoading || !currentUser || !isSystemAdmin) {
    return null;
  }

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    const success = await approveUserAccount(userId);
    setActionLoading(null);
    if (success) {
      await loadManagers();
    } else {
      alert('Failed to approve manager account.');
    }
  };

  const handleDelete = async (userId, name) => {
    if (confirm(`Are you sure you want to delete manager "${name}"?`)) {
      setActionLoading(userId);
      await deleteLookup('users', userId);
      setActionLoading(null);
      await loadManagers();
    }
  };

  // Calculate count of reporting employees for each manager
  const getReportingEmployeeCount = (managerUserId) => {
    return users.filter(u => u.ManagerId === managerUserId).length;
  };

  const filteredItems = (pagedData?.items || []).filter(u => {
    if (statusFilter === 'ACTIVE') return u.IsActive === true;
    if (statusFilter === 'PENDING') return u.IsActive === false;
    return true;
  });

  const totalCount = pagedData?.totalRecords || 0;
  const activeCount = (pagedData?.items || []).filter(u => u.IsActive).length;
  const pendingCount = (pagedData?.items || []).filter(u => !u.IsActive).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCog size={28} style={{ color: 'var(--primary, #3b82f6)' }} />
            <span>Managers Management</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            System Administrator overview of all company managers and team leads across LMS Portal.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Managers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857', textTransform: 'uppercase' }}>Active Managers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{activeCount}</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Pending Approvals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{pendingCount}</div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search manager by name, email, company, department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              style={{ padding: '6px 14px', border: 'none', background: statusFilter === 'ALL' ? '#ffffff' : 'transparent', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: statusFilter === 'ALL' ? '#0f172a' : '#64748b', cursor: 'pointer', boxShadow: statusFilter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              style={{ padding: '6px 14px', border: 'none', background: statusFilter === 'ACTIVE' ? '#ffffff' : 'transparent', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: statusFilter === 'ACTIVE' ? '#047857' : '#64748b', cursor: 'pointer', boxShadow: statusFilter === 'ACTIVE' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              style={{ padding: '6px 14px', border: 'none', background: statusFilter === 'PENDING' ? '#ffffff' : 'transparent', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: statusFilter === 'PENDING' ? '#b45309' : '#64748b', cursor: 'pointer', boxShadow: statusFilter === 'PENDING' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
            >
              Pending Approval
            </button>
          </div>
        </div>
      </div>

      {/* Cards List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Loading managers data...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <AlertCircle size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#334155', margin: '0 0 4px 0' }}>No managers found</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Try adjusting your search terms or filter settings.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {filteredItems.map(user => {
            const reportingCount = getReportingEmployeeCount(user.UserId);

            return (
              <div
                key={user.UserId}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: user.IsActive ? '1px solid #e2e8f0' : '1px solid #fde68a',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <img
                      src={user.ProfilePicturePath || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                      alt={`${user.FirstName} ${user.LastName}`}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.FirstName} {user.LastName}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {user.Email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {user.CompanyName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                        <Building2 size={13} />
                        {user.CompanyName}
                      </span>
                    )}
                    {user.TeamName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                        <Briefcase size={13} />
                        {user.TeamName}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                      <Users size={13} />
                      {reportingCount} Employees Managed
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: user.IsActive ? '#ecfdf5' : '#fef3c7',
                        color: user.IsActive ? '#047857' : '#b45309'
                      }}
                    >
                      {user.IsActive ? <CheckCircle size={13} /> : <Clock size={13} />}
                      {user.IsActive ? 'Active Manager' : 'Pending Sys Admin Approval'}
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  {!user.IsActive && (
                    <button
                      onClick={() => handleApprove(user.UserId)}
                      disabled={actionLoading === user.UserId}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#10b981',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ShieldCheck size={15} />
                      {actionLoading === user.UserId ? 'Approving...' : 'Approve Manager'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.UserId, `${user.FirstName} ${user.LastName}`)}
                    disabled={actionLoading === user.UserId}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagedData && pagedData.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Page <strong>{pagedData.pageNumber}</strong> of <strong>{pagedData.totalPages}</strong> (Total {pagedData.totalRecords} records)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={!pagedData.hasPreviousPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: pagedData.hasPreviousPage ? '#ffffff' : '#f1f5f9',
                color: pagedData.hasPreviousPage ? '#0f172a' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: pagedData.hasPreviousPage ? 'pointer' : 'not-allowed'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPageNumber(p => p + 1)}
              disabled={!pagedData.hasNextPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: pagedData.hasNextPage ? '#ffffff' : '#f1f5f9',
                color: pagedData.hasNextPage ? '#0f172a' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: pagedData.hasNextPage ? 'pointer' : 'not-allowed'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
