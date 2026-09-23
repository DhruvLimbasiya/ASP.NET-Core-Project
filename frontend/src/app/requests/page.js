"use client";

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Requests() {
  const {
    currentUser,
    requests,
    fetchPagedRequests,
    getUserName,
    getLeaveTypeName,
    getStatusBadgeClass,
    getStatusName,
    setShowRequestModal,
    setEditingRequest,
    deleteRequest,
    setSelectedRequestForApproval,
    setShowApprovalModal
  } = useContext(LeaveContext);

  const [statusFilter, setStatusFilter] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pagedData, setPagedData] = useState(null);
  const [loadingPaged, setLoadingPaged] = useState(false);

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : 'EMPLOYEE');
  const isSysAdmin = currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'ADMIN';
  const isManager = userRoleName === 'MANAGER' || isSysAdmin;

  const { users } = useContext(LeaveContext);

  const loadPagedData = useCallback(async () => {
    if (!fetchPagedRequests) return;
    setLoadingPaged(true);

    let statusId = null;
    if (statusFilter === 'pending') statusId = 1;
    if (statusFilter === 'approved') statusId = 2;
    if (statusFilter === 'rejected') statusId = 3;

    let targetUserId = null;
    let targetManagerId = null;

    if (isSysAdmin) {
      // SysAdmin sees all
    } else if (isManager && currentUser?.UserId) {
      targetManagerId = currentUser.UserId;
    } else if (currentUser?.UserId) {
      targetUserId = currentUser.UserId;
    }

    const res = await fetchPagedRequests({
      pageNumber,
      pageSize,
      userId: targetUserId,
      managerId: targetManagerId,
      statusId
    });

    if (res) {
      setPagedData(res);
    } else {
      setPagedData(null);
    }
    setLoadingPaged(false);
  }, [fetchPagedRequests, pageNumber, pageSize, statusFilter, isSysAdmin, isManager, currentUser]);

  useEffect(() => {
    loadPagedData();
  }, [loadPagedData, requests]);

  const myTeamUserIds = new Set(
    (users || []).filter(u => u.ManagerId === currentUser?.UserId || u.UserId === currentUser?.UserId).map(u => u.UserId)
  );

  // Fallback to in-memory requests array if API is loading or not returned
  const fallbackRequests = (isSysAdmin
    ? requests
    : isManager
    ? requests.filter(r => myTeamUserIds.has(r.UserId))
    : requests.filter(r => r.UserId === currentUser?.UserId)
  ).filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return r.StatusId === 1;
    if (statusFilter === 'approved') return r.StatusId === 2;
    if (statusFilter === 'rejected') return r.StatusId === 3;
    return true;
  });

  const displayRequests = pagedData?.items ?? fallbackRequests.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const totalRecords = pagedData?.totalRecords ?? fallbackRequests.length;
  const totalPages = pagedData?.totalPages ?? Math.max(1, Math.ceil(totalRecords / pageSize));

  return (
    <div className="panel-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="panel-title">Leave Requests</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: '150px', padding: '6px 12px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {!isManager && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingRequest(null);
                setShowRequestModal(true);
              }}
              style={{ background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Request Leave
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              {isManager && <th>Employee</th>}
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRequests.map(r => (
              <tr key={r.RequestId}>
                {isManager && (
                  <td style={{ fontWeight: 700 }}>{getUserName(r.UserId)}</td>
                )}
                <td>{getLeaveTypeName(r.LeaveTypeId)}</td>
                <td>
                  {new Date(r.StartDate).toLocaleDateString()} - {new Date(r.EndDate).toLocaleDateString()}
                </td>
                <td>{r.TotalDays}</td>
                <td>{r.Reason || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>None Provided</span>}</td>
                <td>
                  <span className={getStatusBadgeClass(r.StatusId)}>
                    {getStatusName(r.StatusId)}
                  </span>
                </td>
                <td>
                  {isManager ? (
                    r.StatusId === 1 ? (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedRequestForApproval(r);
                          setShowApprovalModal(true);
                        }}
                      >
                        Review
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Reviewed</span>
                    )
                  ) : (
                    r.StatusId === 1 ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditingRequest(r);
                            setShowRequestModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline btn-outline-danger btn-sm"
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this leave request?')) {
                              deleteRequest(r.RequestId);
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Processed</span>
                    )
                  )}
                </td>
              </tr>
            ))}

            {displayRequests.length === 0 && (
              <tr>
                <td colSpan={isManager ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '32px' }}>
                  {loadingPaged ? 'Loading leave requests...' : 'No leave requests found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color, #e5e7eb)',
          backgroundColor: '#fafafa',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: '#4b5563' }}>
          <span>Show per page:</span>
          <select
            className="form-control"
            style={{ width: '70px', padding: '4px 8px', fontSize: '0.875rem' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>
            Showing {totalRecords > 0 ? (pageNumber - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(pageNumber * pageSize, totalRecords)} of {totalRecords} records
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer' }}
            disabled={pageNumber <= 1 || loadingPaged}
            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 8px', color: '#111827' }}>
            Page {pageNumber} of {totalPages}
          </span>

          <button
            className="btn btn-outline"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer' }}
            disabled={pageNumber >= totalPages || loadingPaged}
            onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
