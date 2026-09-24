"use client";

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

export default function Header({ activeTab, currentUser, userRoleName, onSignOut }) {
  const formatTabName = (tab) => {
    if (!tab) return 'Dashboard';
    return tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getAvatarUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80";
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads/')) return `http://localhost:5148${path}`;
    return path;
  };

  return (
    <header className="app-header">
      <div className="header-title">
        {formatTabName(activeTab)}
      </div>
      
      <div className="header-user" style={{ gap: '12px' }}>
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <img
            src={getAvatarUrl(currentUser?.ProfilePicturePath)}
            alt="Avatar"
            className="user-avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80";
            }}
          />
          <div className="user-info">
            <span className="user-name">{currentUser ? `${currentUser.FirstName} ${currentUser.LastName}` : 'Loading...'}</span>
            <span className="user-role">{userRoleName}</span>
          </div>
        </Link>

        <Link
          href="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginLeft: '8px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)'
          }}
          title="Edit Profile"
        >
          <User size={15} />
          Profile
        </Link>
        
        <button
          onClick={onSignOut}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--text-medium)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
