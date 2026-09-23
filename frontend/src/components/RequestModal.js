"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function RequestModal({ isOpen, onClose, onSubmit, editingRequest, leaveTypes, currentUser, balances, isManager }) {
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingRequest) {
        setLeaveTypeId(editingRequest.LeaveTypeId);
        setStartDate(editingRequest.StartDate ? editingRequest.StartDate.split('T')[0] : '');
        setEndDate(editingRequest.EndDate ? editingRequest.EndDate.split('T')[0] : '');
        setReason(editingRequest.Reason || '');
        setTotalDays(editingRequest.TotalDays);
      } else {
        setLeaveTypeId(leaveTypes[0]?.LeaveTypeId || '');
        setStartDate('');
        setEndDate('');
        setReason('');
        setTotalDays(0);
      }
      setError('');
    }
  }, [isOpen, editingRequest, leaveTypes]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
        setError('');
      } else {
        setTotalDays(0);
        setError('End date must be after or equal to start date.');
      }
    } else {
      setTotalDays(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (totalDays <= 0) {
      setError('Invalid date range.');
      return;
    }

    if (!isManager) {
      const typeBalance = balances.find(
        b => b.UserId === currentUser.UserId && b.LeaveTypeId === Number(leaveTypeId) && b.CalendarYearId === 1
      );
      const allocated = typeBalance ? typeBalance.AllocatedDays : 0;
      const used = typeBalance ? typeBalance.UsedDays : 0;
      const available = allocated - used;
      
      if (totalDays > available) {
        setError(`Insufficient leave balance. You only have ${available} days left.`);
        return;
      }
    }

    onSubmit({
      LeaveTypeId: Number(leaveTypeId),
      StartDate: new Date(startDate).toISOString(),
      EndDate: new Date(endDate).toISOString(),
      TotalDays: totalDays,
      Reason: reason
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">{editingRequest ? 'Modify Leave Request' : 'Submit Leave Request'}</span>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {error && (
              <div className="grid-span-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group grid-span-2">
              <label className="form-label">Leave Type</label>
              <select
                className="form-control"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                required
              >
                {leaveTypes.map(t => (
                  <option key={t.LeaveTypeId} value={t.LeaveTypeId}>
                    {t.TypeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group grid-span-2">
              <label className="form-label">Total Days Requested</label>
              <input
                type="text"
                className="form-control"
                value={totalDays > 0 ? `${totalDays} Days` : ''}
                disabled
              />
            </div>

            <div className="form-group grid-span-2">
              <label className="form-label">Reason / Comments</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="State the purpose for this leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#000000', color: '#ffffff' }}>
              {editingRequest ? 'Save Changes' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
