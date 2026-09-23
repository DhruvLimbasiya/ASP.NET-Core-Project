"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function LeaveTypeModal({ isOpen, onClose, onSubmit, editingLeaveType }) {
  const [name, setName] = useState('');
  const [days, setDays] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLeaveType) {
      setName(editingLeaveType.TypeName || '');
      const existingDays = editingLeaveType.DefaultDays ?? editingLeaveType.defaultDays;
      setDays(existingDays && existingDays > 0 ? Number(existingDays) : 10);
    } else {
      setName('');
      setDays(10);
    }
    setError('');
  }, [editingLeaveType, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required.');
      return;
    }
    onSubmit({ name, days });
    setName('');
    setDays(10);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <span className="modal-title">{editingLeaveType ? 'Edit Leave Type' : 'Create Leave Type'}</span>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ paddingBottom: '20px' }}>
            {error && (
              <div className="grid-span-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group grid-span-2">
              <label className="form-label">Type Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Parental Leave"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group grid-span-2">
              <label className="form-label">Default Allowed Days *</label>
              <input
                type="number"
                className="form-control"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#000000', color: '#ffffff' }}>
              {editingLeaveType ? 'Save Changes' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
