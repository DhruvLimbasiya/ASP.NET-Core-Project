"use client";

import React from 'react';

export default function Header({ activeTab, currentUser, userRoleName, onSignOut }) {
  const formatTabName = (tab) => {
    return tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <header className="app-header">
      <div className="header-title">
        {formatTabName(activeTab)}
      </div>
      
      <div className="header-user">
        <img
          src={currentUser?.ProfilePicturePath || "/default-avatar.png"}
          alt="Avatar"
          className="user-avatar"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80";
          }}
        />
        <div className="user-info">
          <span className="user-name">{currentUser ? `${currentUser.FirstName} ${currentUser.LastName}` : 'Loading...'}</span>
          <span className="user-role">{userRoleName}</span>
        </div>
        
        <button
          onClick={onSignOut}
          style={{
            marginLeft: '12px',
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
