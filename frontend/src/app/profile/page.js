"use client";

import React, { useContext, useState, useEffect } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import { User, Mail, Lock, Building, Users, Upload, Camera, CheckCircle, AlertCircle, ShieldCheck, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useContext(LeaveContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.FirstName || '');
      setLastName(currentUser.LastName || '');
      setEmail(currentUser.Email || '');
      
      const avatarPath = currentUser.ProfilePicturePath;
      if (avatarPath) {
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
          setPreviewUrl(avatarPath);
        } else if (avatarPath.startsWith('/uploads/')) {
          setPreviewUrl(`http://localhost:5148${avatarPath}`);
        } else {
          setPreviewUrl(avatarPath);
        }
      } else {
        setPreviewUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
      }
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('FirstName', firstName);
    formData.append('LastName', lastName);
    formData.append('Email', email);
    if (password) {
      formData.append('Password', password);
    }
    if (selectedFile) {
      formData.append('ProfilePicture', selectedFile);
    }

    const result = await updateUserProfile(currentUser.UserId, formData);
    setIsSubmitting(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
      setPassword('');
      setSelectedFile(null);
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to update profile.' });
    }
  };

  if (!currentUser) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  const roleName = currentUser.Role?.RoleName || (currentUser.RoleId === 1 ? 'Manager' : currentUser.RoleId === 3 ? 'System Administrator' : 'Employee');

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>My Profile</h1>
        <p style={{ color: 'var(--text-medium)', fontSize: '0.95rem' }}>
          Manage your account settings and personal information.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#047857' : '#dc2626',
          fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Card Header with Avatar Upload */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={previewUrl}
              alt="Profile Avatar"
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--primary-light)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
              }}
            />
            <label
              htmlFor="avatar-upload"
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease'
              }}
              title="Upload new profile picture"
            >
              <Camera size={18} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
              {currentUser.FirstName} {currentUser.LastName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="badge badge-approved" style={{ fontSize: '0.8rem', padding: '4px 10px', fontWeight: 600 }}>
                {roleName}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-medium)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {currentUser.Email}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: 0 }}>
              Click the camera icon on the avatar to upload a new profile picture.
            </p>
          </div>
        </div>

        {/* Editable Personal Details */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            Editable Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>First Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Last Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>New Password (Leave blank to keep current)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only / Immutable Approved Details */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', backgroundColor: '#fafafa', border: '1px dashed var(--border-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--warning)' }} />
              Approved Company & Team Credentials
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Approved & Locked
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-medium)', marginBottom: '1.25rem' }}>
            The following fields were assigned and verified upon your account approval. They cannot be modified directly from profile editing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-medium)' }}>Approved Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: 600 }}
                  value={currentUser.CompanyName || 'Not Specified'}
                  disabled
                  readOnly
                />
              </div>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Company name set upon approval (Locked)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-medium)' }}>Approved Team / Department</label>
              <div style={{ position: 'relative' }}>
                <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: 600 }}
                  value={currentUser.TeamName || 'Not Specified'}
                  disabled
                  readOnly
                />
              </div>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Department set upon approval (Locked)
              </small>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-medium)' }}>Approved Account Role & Manager</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#475569', fontWeight: 600 }}
                  value={`${roleName} ${currentUser.ManagerName ? `(Manager: ${currentUser.ManagerName})` : ''}`}
                  disabled
                  readOnly
                />
              </div>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Role and approval tier are locked.
              </small>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={18} />
            {isSubmitting ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
