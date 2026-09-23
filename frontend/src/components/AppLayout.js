"use client";

import React, { useContext, useState, useEffect } from 'react';
import { LeaveContext } from '../context/LeaveContext';
import Sidebar from './Sidebar';
import Header from './Header';
import RequestModal from './RequestModal';
import LeaveTypeModal from './LeaveTypeModal';
import ApprovalModal from './ApprovalModal';
import { CalendarDays, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AppLayout({ children }) {
  const {
    currentUser,
    login,
    logout,
    loading,
    users,
    leaveTypes,
    balances,
    showRequestModal,
    setShowRequestModal,
    showLeaveTypeModal,
    setShowLeaveTypeModal,
    showApprovalModal,
    setShowApprovalModal,
    selectedRequestForApproval,
    setSelectedRequestForApproval,
    editingRequest,
    setEditingRequest,
    editingLeaveType,
    setEditingLeaveType,
    handleRequestSubmit,
    handleLeaveTypeSubmit,
    handleApprove,
    handleReject,
    getUserName,
    getLeaveTypeName,
    saveLookup,
    refreshData
  } = useContext(LeaveContext);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser && pathname !== '/login') {
        router.replace('/login');
      } else if (currentUser && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  }, [currentUser, loading, pathname, router]);

  // Login Form states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRoleId, setRegRoleId] = useState(2); // 1 = Manager, 2 = Employee
  const [regManagerId, setRegManagerId] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regTeamName, setRegTeamName] = useState('');
  const [regCompanySelect, setRegCompanySelect] = useState('');
  const [regTeamSelect, setRegTeamSelect] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessInfo, setRegSuccessInfo] = useState('');

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : currentUser?.RoleId === 3 ? 'SYSTEM ADMINISTRATOR' : 'EMPLOYEE');
  const isManager = userRoleName === 'MANAGER' || userRoleName === 'ADMIN' || userRoleName === 'SYSTEM ADMINISTRATOR';
  const isSystemAdmin = currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'SYSADMIN' || userRoleName === 'SYSTEM ADMIN';

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!emailInput || !passwordInput) {
      setLoginError('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    const result = await login(emailInput, passwordInput);
    setIsSubmitting(false);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessInfo('');

    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegError('Please fill in all fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    let company = regRoleId === 1 ? regCompanyName : regCompanySelect;
    let team = regRoleId === 1 ? regTeamName : regTeamSelect;

    if (Number(regRoleId) === 1 && (!regCompanyName || !regTeamName)) {
      setRegError('Please provide your Company Name and Team Name.');
      return;
    }

    if (Number(regRoleId) === 2 && managerList.length > 0 && !regManagerId) {
      setRegError('Please select your Company, Team, and Assigned Manager.');
      return;
    }

    const selectedManager = users.find(u => u.UserId === Number(regManagerId));
    if (Number(regRoleId) === 2 && selectedManager) {
      company = selectedManager.CompanyName || company;
      team = selectedManager.TeamName || team;
    }

    const payload = {
      RoleId: Number(regRoleId),
      FirstName: regFirstName,
      LastName: regLastName,
      Email: regEmail,
      Password: regPassword,
      IsActive: false, // Pending Approval by Admin/Manager
      ManagerId: Number(regRoleId) === 2 && regManagerId ? Number(regManagerId) : null,
      CompanyName: company || null,
      TeamName: team || null,
      ProfilePicturePath: regRoleId === 1 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };

    setIsSubmitting(true);
    const success = await saveLookup('users', payload);
    setIsSubmitting(false);

    if (success) {
      setIsRegistering(false);
      setEmailInput(regEmail);
      setPasswordInput(regPassword);
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegManagerId('');
      setRegCompanyName('');
      setRegTeamName('');
      setRegCompanySelect('');
      setRegTeamSelect('');
      setLoginError('');
      setRegSuccessInfo(
        Number(regRoleId) === 1
          ? 'Registration submitted successfully! Manager accounts require approval from Sys Admin before signing in.'
          : 'Registration submitted successfully! Employee accounts require approval from a Manager before signing in.'
      );
    } else {
      setRegError('Registration failed. Check backend server.');
    }
  };

  const getQuickUsers = () => {
    return [
      {
        Email: 'sysadmin@lms.com',
        Password: 'adminpassword123',
        FirstName: 'Sys',
        LastName: 'Admin',
        RoleName: 'System Administrator',
        ProfilePicturePath: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
      },
      {
        Email: 'admin@lms.com',
        Password: 'adminpassword',
        FirstName: 'John',
        LastName: 'Doe',
        RoleName: 'Manager',
        ProfilePicturePath: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        Email: 'jane@lms.com',
        Password: 'password',
        FirstName: 'Jane',
        LastName: 'Smith',
        RoleName: 'Employee',
        ProfilePicturePath: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ];
  };

  const handleQuickLogin = async (u) => {
    setEmailInput(u.Email);
    setPasswordInput(u.Password);
    setLoginError('');
    setIsSubmitting(true);

    let result = await login(u.Email, u.Password);
    
    // If sysadmin account was not in database yet, create it and retry login
    if (!result.success && u.Email === 'sysadmin@lms.com') {
      const sysAdminPayload = {
        RoleId: 3,
        FirstName: 'Sys',
        LastName: 'Admin',
        Email: 'sysadmin@lms.com',
        Password: 'adminpassword123',
        IsActive: true,
        ProfilePicturePath: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
      };
      await saveLookup('users', sysAdminPayload);
      result = await login(u.Email, u.Password);
    }

    setIsSubmitting(false);
    if (!result.success) {
      setLoginError(result.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: isRegistering ? '520px' : '440px' }}>
          <div className="login-header">
            <div className="login-logo">
              <CalendarDays size={24} />
            </div>
            <h2>LMS Portal</h2>
            <p>{isRegistering ? 'Create your Leave Management account' : 'Sign in to your Leave Management account'}</p>
          </div>

          {isRegistering ? (
            <form onSubmit={handleRegisterSubmit}>
              {regError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} />
                  <span>{regError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Jane"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Smith"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="jane.smith@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ paddingRight: '40px', width: '100%' }}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ paddingRight: '40px', width: '100%' }}
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: Number(regRoleId) === 2 ? '14px' : '24px' }}>
                <label className="form-label">Register As *</label>
                <select
                  className="form-control"
                  value={regRoleId}
                  onChange={(e) => setRegRoleId(Number(e.target.value))}
                >
                  <option value={2}>Employee (Tracks leaves & balances)</option>
                  <option value={1}>Manager (Reviews approvals & configurations)</option>
                </select>
              </div>

              {Number(regRoleId) === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. TCS"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team / Department *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engineering"
                      value={regTeamName}
                      onChange={(e) => setRegTeamName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {Number(regRoleId) === 2 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Company *</label>
                      <select
                        className="form-control"
                        value={regCompanySelect}
                        onChange={(e) => {
                          setRegCompanySelect(e.target.value);
                          setRegTeamSelect('');
                          setRegManagerId('');
                        }}
                        required
                      >
                        <option value="">-- Select Company --</option>
                        {Array.from(new Set(users.filter(u => (u.RoleId === 1 || u.Role?.RoleName?.toUpperCase() === 'MANAGER') && u.CompanyName).map(u => u.CompanyName)))
                          .map(c => <option key={c} value={c}>{c}</option>)
                        }
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Team / Department *</label>
                      <select
                        className="form-control"
                        value={regTeamSelect}
                        onChange={(e) => {
                          setRegTeamSelect(e.target.value);
                          setRegManagerId('');
                        }}
                        required
                      >
                        <option value="">-- Select Team --</option>
                        {Array.from(new Set(users.filter(u => (u.RoleId === 1 || u.Role?.RoleName?.toUpperCase() === 'MANAGER') && (!regCompanySelect || u.CompanyName === regCompanySelect) && u.TeamName).map(u => u.TeamName)))
                          .map(t => <option key={t} value={t}>{t}</option>)
                        }
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Assigned Manager *</label>
                    <select
                      className="form-control"
                      value={regManagerId}
                      onChange={(e) => setRegManagerId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Assigned Manager --</option>
                      {users
                        .filter(u => (u.RoleId === 1 || u.Role?.RoleName?.toUpperCase() === 'MANAGER') &&
                          (!regCompanySelect || u.CompanyName === regCompanySelect) &&
                          (!regTeamSelect || u.TeamName === regTeamSelect))
                        .map(m => (
                          <option key={m.UserId} value={m.UserId}>
                            {m.FirstName} {m.LastName} ({m.CompanyName || 'No Company'} - {m.TeamName || 'No Team'})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', background: '#000000', color: '#ffffff', padding: '12px', marginBottom: '14px' }}>
                {isSubmitting ? 'Registering...' : 'Register Account'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-medium)' }}>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setRegError(''); }}
                  style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleLoginSubmit}>
                {regSuccessInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CalendarDays size={16} />
                    <span>{regSuccessInfo}</span>
                  </div>
                )}

                {loginError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. jane@lms.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ paddingRight: '40px', width: '100%' }}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', background: '#000000', color: '#ffffff', padding: '12px', marginBottom: '14px' }}>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-medium)' }}>New to LMS Portal? </span>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setLoginError(''); }}
                  style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Here
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Active tab formatting for Header
  const rawTab = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
  const activeTabName = rawTab.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  return (
    <div className="app-container">
      <Sidebar
        isManager={isManager}
        isSystemAdmin={isSystemAdmin}
        currentUser={currentUser}
      />

      <div className="content-wrapper">
        <Header
          activeTab={activeTabName}
          currentUser={currentUser}
          userRoleName={userRoleName}
          onSignOut={handleSignOut}
        />

        <main className="main-content">
          {children}
        </main>
      </div>

      <RequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setEditingRequest(null);
        }}
        onSubmit={handleRequestSubmit}
        editingRequest={editingRequest}
        leaveTypes={leaveTypes}
        currentUser={currentUser}
        balances={balances}
        isManager={isManager}
      />

      <LeaveTypeModal
        isOpen={showLeaveTypeModal}
        onClose={() => {
          setShowLeaveTypeModal(false);
          setEditingLeaveType(null);
        }}
        onSubmit={handleLeaveTypeSubmit}
        editingLeaveType={editingLeaveType}
      />

      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRequestForApproval(null);
        }}
        request={selectedRequestForApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        getUserName={getUserName}
        getLeaveTypeName={getLeaveTypeName}
      />
    </div>
  );
}
