"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ApprovalModal({ isOpen, onClose, request, onApprove, onReject, getUserName, getLeaveTypeName }) {
  const [comments, setComments] = useState('');

  if (!isOpen || !request) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <span className="modal-title">Review Leave Request</span>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="form-grid" style={{ paddingBottom: '20px' }}>
          <div className="grid-span-2" style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <strong>Employee:</strong> {getUserName(request.UserId)}
            </div>
            <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <strong>Leave Type:</strong> {getLeaveTypeName(request.LeaveTypeId)}
            </div>
            <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <strong>Duration:</strong> {request.TotalDays} Days
            </div>
            <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <strong>Dates:</strong> {new Date(request.StartDate).toLocaleDateString()} - {new Date(request.EndDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Reason:</strong> {request.Reason || 'None provided'}
            </div>
          </div>

          <div className="form-group grid-span-2">
            <label className="form-label">Manager Comments</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Add approval or rejection remarks..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              style={{ background: 'var(--danger)', color: '#ffffff' }}
              onClick={() => {
                onReject(request.RequestId, comments);
                setComments('');
              }}
            >
              Reject Request
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: 'var(--success)', color: '#ffffff' }}
              onClick={() => {
                onApprove(request.RequestId, comments);
                setComments('');
              }}
            >
              Approve Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
