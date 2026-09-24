"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

export const LeaveContext = createContext(null);

const API_BASE = 'http://localhost:5148/api';

const toPascalCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toPascalCase);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        newObj[pascalKey] = toPascalCase(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const unwrapData = (res) => {
  if (res && typeof res === 'object') {
    if (Array.isArray(res)) return res;
    if (res.data !== undefined) return res.data ?? [];
    if (res.Data !== undefined) return res.Data ?? [];
  }
  return res ?? [];
};

export function LeaveProvider({ children }) {
  const [jwtToken, setJwtToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [calendarYears, setCalendarYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('lms_jwt_token');
      if (storedToken) {
        setJwtToken(storedToken);
      }
      const storedUser = localStorage.getItem('lms_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
    }
  }, []);

  const getAuthHeaders = useCallback((tokenOverride) => {
    const token = tokenOverride || jwtToken || (typeof window !== 'undefined' ? localStorage.getItem('lms_jwt_token') : null);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [jwtToken]);

  const logout = useCallback(() => {
    setJwtToken(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lms_jwt_token');
      localStorage.removeItem('lms_user');
    }
  }, []);

  // Fetch all data using Bearer auth token
  const fetchData = useCallback(async (tokenOverride) => {
    const headers = getAuthHeaders(tokenOverride);
    try {
      setLoading(true);
      const [
        resUsers,
        resRequests,
        resApprovals,
        resBalances,
        resTypes,
        resRoles,
        resStatuses,
        resYears
      ] = await Promise.all([
        fetch(`${API_BASE}/Users`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/LeaveRequests`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/LeaveApprovals`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/LeaveBalances`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/LeaveTypes`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/Roles`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/Statuses`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : [])),
        fetch(`${API_BASE}/CalendarYears`, { headers }).then(r => r.ok ? r.json() : (r.status === 401 ? 'UNAUTH' : []))
      ]);

      if (resUsers === 'UNAUTH' || resRequests === 'UNAUTH') {
        logout();
        return;
      }

      const pascalUsers = toPascalCase(unwrapData(resUsers));
      setUsers(pascalUsers);
      setRequests(toPascalCase(unwrapData(resRequests)));
      setApprovals(toPascalCase(unwrapData(resApprovals)));
      setBalances(toPascalCase(unwrapData(resBalances)));
      setLeaveTypes(toPascalCase(unwrapData(resTypes)));
      setRoles(toPascalCase(unwrapData(resRoles)));
      setStatuses(toPascalCase(unwrapData(resStatuses)));
      setCalendarYears(toPascalCase(unwrapData(resYears)));
    } catch (err) {
      console.error('Error fetching data from backend', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, logout]);

  // Login via POST /api/Auth/login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const authData = data.data;
        const token = authData.token || authData.Token;
        const userObj = toPascalCase(authData.user || authData.User);

        setJwtToken(token);
        setCurrentUser(userObj);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lms_jwt_token', token);
          localStorage.setItem('lms_user', JSON.stringify(userObj));
        }

        await fetchData(token);
        return { success: true, message: data.message || 'Login successful.' };
      } else {
        return {
          success: false,
          message: data.message || (data.errors && data.errors.join(', ')) || 'Invalid email or password.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Failed to connect to backend server.' };
    }
  };

  // Verify session on mount via GET /api/Auth/me
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('lms_jwt_token');
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE}/Auth/me`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const userObj = toPascalCase(data.data);
              setCurrentUser(userObj);
              localStorage.setItem('lms_user', JSON.stringify(userObj));
              await fetchData(storedToken);
              return;
            }
          }
          // If 401 or invalid response, logout
          logout();
        } catch (err) {
          console.error('Auth verification error:', err);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchData, logout]);

  const selectUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('lms_user', JSON.stringify(user));
    } else {
      logout();
    }
  };

  // Leave Requests CRUD
  const addRequest = async (payload) => {
    try {
      const response = await fetch(`${API_BASE}/LeaveRequests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          UserId: currentUser?.UserId,
          ...payload,
          StatusId: 1 // Default status is Pending
        })
      });
      if (response.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error('Error adding request:', error);
    }
    return false;
  };

  const updateRequest = async (id, payload) => {
    try {
      const response = await fetch(`${API_BASE}/LeaveRequests/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          RequestId: id,
          ...payload
        })
      });
      if (response.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
    return false;
  };

  const deleteRequest = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/LeaveRequests/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
    return false;
  };

  // Leave Approvals / Actions
  const approveRequest = async (requestId, approvedByUserId, comments = '') => {
    try {
      const req = requests.find(r => r.RequestId === requestId);
      if (!req) return false;

      // 1. Post to LeaveApprovals
      const approvalRes = await fetch(`${API_BASE}/LeaveApprovals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          RequestId: requestId,
          ApprovedBy: approvedByUserId,
          Action: 'Approved',
          Comments: comments,
          ActionDate: new Date().toISOString()
        })
      });

      if (!approvalRes.ok) return false;

      // 2. Update Request Status to Approved (StatusId = 2)
      const updateReqRes = await fetch(`${API_BASE}/LeaveRequests/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...req,
          StatusId: 2 // Approved
        })
      });

      if (!updateReqRes.ok) return false;

      // 3. Deduct Leave Balance
      const balance = balances.find(
        b => b.UserId === req.UserId && b.LeaveTypeId === req.LeaveTypeId && b.CalendarYearId === 1
      );
      if (balance) {
        await fetch(`${API_BASE}/LeaveBalances/${balance.BalanceId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...balance,
            UsedDays: balance.UsedDays + req.TotalDays
          })
        });
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error approving request:', error);
    }
    return false;
  };

  const rejectRequest = async (requestId, approvedByUserId, comments = '') => {
    try {
      const req = requests.find(r => r.RequestId === requestId);
      if (!req) return false;

      // 1. Post to LeaveApprovals
      const approvalRes = await fetch(`${API_BASE}/LeaveApprovals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          RequestId: requestId,
          ApprovedBy: approvedByUserId,
          Action: 'Rejected',
          Comments: comments,
          ActionDate: new Date().toISOString()
        })
      });

      if (!approvalRes.ok) return false;

      // 2. Update Request Status to Rejected (StatusId = 3)
      const updateReqRes = await fetch(`${API_BASE}/LeaveRequests/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...req,
          StatusId: 3 // Rejected
        })
      });

      if (updateReqRes.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
    return false;
  };

  // Generic CRUD helpers for Lookups
  const saveLookup = async (type, payload) => {
    const endpoints = {
      leaveTypes: 'LeaveTypes',
      roles: 'Roles',
      statuses: 'Statuses',
      calendarYears: 'CalendarYears',
      users: 'Users',
      balances: 'LeaveBalances'
    };
    const idFields = {
      leaveTypes: 'LeaveTypeId',
      roles: 'RoleId',
      statuses: 'StatusId',
      calendarYears: 'CalendarYearId',
      users: 'UserId',
      balances: 'BalanceId'
    };

    const endpoint = endpoints[type];
    const idField = idFields[type];
    const id = payload[idField];

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/${endpoint}/${id}` : `${API_BASE}/${endpoint}`;
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error(`Error saving lookup ${type}:`, error);
    }
    return false;
  };

  const deleteLookup = async (type, id) => {
    const endpoints = {
      leaveTypes: 'LeaveTypes',
      roles: 'Roles',
      statuses: 'Statuses',
      calendarYears: 'CalendarYears',
      users: 'Users',
      balances: 'LeaveBalances'
    };
    const endpoint = endpoints[type];
    try {
      const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error(`Error deleting lookup ${type}:`, error);
    }
    return false;
  };

  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);

  // Helper maps
  const getUserName = (userId) => {
    const u = users.find(x => x.UserId === userId);
    return u ? `${u.FirstName} ${u.LastName}` : `User #${userId}`;
  };

  const getLeaveTypeName = (typeId) => {
    const t = leaveTypes.find(x => x.LeaveTypeId === typeId);
    return t ? t.TypeName : `Leave Type #${typeId}`;
  };

  const getStatusBadgeClass = (statusId) => {
    const s = statuses.find(x => x.StatusId === statusId);
    const name = s ? s.StatusName.toLowerCase() : 'pending';
    if (name.includes('approve')) return 'badge badge-approved';
    if (name.includes('reject')) return 'badge badge-rejected';
    return 'badge badge-pending';
  };

  const getStatusName = (statusId) => {
    const s = statuses.find(x => x.StatusId === statusId);
    return s ? s.StatusName : 'Pending';
  };

  const handleRequestSubmit = async (payload) => {
    let success;
    if (editingRequest) {
      success = await updateRequest(editingRequest.RequestId, {
        ...editingRequest,
        ...payload
      });
    } else {
      success = await addRequest(payload);
    }
    if (success) {
      setShowRequestModal(false);
      setEditingRequest(null);
    } else {
      alert('Error saving leave request. Verify backend server.');
    }
  };

  const [editingLeaveType, setEditingLeaveType] = useState(null);

  const handleLeaveTypeSubmit = async ({ name, days }) => {
    const cssClass = `leave-${name.toLowerCase().replace(/\s+/g, '-')}`;
    const numDays = Number(days) || 10;
    let success;
    if (editingLeaveType) {
      success = await saveLookup('leaveTypes', {
        LeaveTypeId: editingLeaveType.LeaveTypeId,
        TypeName: name,
        CssClass: cssClass,
        DefaultDays: numDays
      });
    } else {
      success = await saveLookup('leaveTypes', {
        TypeName: name,
        CssClass: cssClass,
        DefaultDays: numDays
      });
    }

    if (success) {
      await fetchData();
      const latestTypesRes = await fetch(`${API_BASE}/LeaveTypes`, { headers: getAuthHeaders() }).then(r => r.json());
      const latestTypes = toPascalCase(unwrapData(latestTypesRes));
      const targetType = latestTypes.find(t => t.TypeName?.toLowerCase() === name?.toLowerCase());
      
      if (targetType && targetType.LeaveTypeId && users.length > 0) {
        await Promise.all(users.map(async u => {
          const existingBal = balances.find(b => b.UserId === u.UserId && b.LeaveTypeId === targetType.LeaveTypeId && b.CalendarYearId === 1);
          return saveLookup('balances', {
            ...(existingBal ? { BalanceId: existingBal.BalanceId } : {}),
            UserId: u.UserId,
            LeaveTypeId: targetType.LeaveTypeId,
            CalendarYearId: 1,
            AllocatedDays: numDays,
            UsedDays: existingBal ? existingBal.UsedDays : 0
          });
        }));
      }
      setShowLeaveTypeModal(false);
      setEditingLeaveType(null);
      await fetchData();
    } else {
      alert('Error saving leave type.');
    }
  };

  const handleApprove = async (requestId, comments) => {
    const success = await approveRequest(requestId, currentUser.UserId, comments);
    if (success) {
      setShowApprovalModal(false);
      setSelectedRequestForApproval(null);
    }
  };

  const handleReject = async (requestId, comments) => {
    const success = await rejectRequest(requestId, currentUser.UserId, comments);
    if (success) {
      setShowApprovalModal(false);
      setSelectedRequestForApproval(null);
    }
  };

  const handleDeleteLookup = async (type, id) => {
    if (confirm(`Are you sure you want to delete this ${type === 'leaveTypes' ? 'leave type' : type.slice(0, -1)}?`)) {
      await deleteLookup(type, id);
    }
  };

  const fetchPagedRequests = useCallback(async ({ pageNumber = 1, pageSize = 5, userId = null, managerId = null, statusId = null } = {}) => {
    const headers = getAuthHeaders();
    try {
      const params = new URLSearchParams({
        pageNumber,
        pageSize
      });
      if (userId) params.append('userId', userId);
      if (managerId) params.append('managerId', managerId);
      if (statusId) params.append('statusId', statusId);

      const res = await fetch(`${API_BASE}/LeaveRequests/paged?${params.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const items = toPascalCase(json.data.items || json.data.Items || []);
          return {
            items,
            pageNumber: json.data.pageNumber || json.data.PageNumber || pageNumber,
            pageSize: json.data.pageSize || json.data.PageSize || pageSize,
            totalRecords: json.data.totalRecords || json.data.TotalRecords || 0,
            totalPages: json.data.totalPages || json.data.TotalPages || 1,
            hasPreviousPage: json.data.hasPreviousPage ?? json.data.HasPreviousPage ?? false,
            hasNextPage: json.data.hasNextPage ?? json.data.HasNextPage ?? false
          };
        }
      }
    } catch (err) {
      console.error('Error fetching paged leave requests:', err);
    }
    return null;
  }, [getAuthHeaders]);

  const fetchPagedUsers = useCallback(async ({ pageNumber = 1, pageSize = 5, search = '', roleId = null, managerId = null } = {}) => {
    const headers = getAuthHeaders();
    try {
      const params = new URLSearchParams({
        pageNumber,
        pageSize
      });
      if (search) params.append('search', search);
      if (roleId) params.append('roleId', roleId);
      if (managerId) params.append('managerId', managerId);

      const res = await fetch(`${API_BASE}/Users/paged?${params.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const items = toPascalCase(json.data.items || json.data.Items || []);
          return {
            items,
            pageNumber: json.data.pageNumber || json.data.PageNumber || pageNumber,
            pageSize: json.data.pageSize || json.data.PageSize || pageSize,
            totalRecords: json.data.totalRecords || json.data.TotalRecords || 0,
            totalPages: json.data.totalPages || json.data.TotalPages || 1,
            hasPreviousPage: json.data.hasPreviousPage ?? json.data.HasPreviousPage ?? false,
            hasNextPage: json.data.hasNextPage ?? json.data.HasNextPage ?? false
          };
        }
      }
    } catch (err) {
      console.error('Error fetching paged users:', err);
    }
    return null;
  }, [getAuthHeaders]);

  const approveUserAccount = async (userId) => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`${API_BASE}/Users/${userId}/approve`, {
        method: 'PUT',
        headers
      });
      if (response.ok) {
        await fetchData();
        return true;
      }
    }
    return false;
  };

  const updateUserProfile = async (userId, formData) => {
    const token = jwtToken || (typeof window !== 'undefined' ? localStorage.getItem('lms_jwt_token') : null);
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/Users/${userId}/profile`, {
        method: 'PUT',
        headers,
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = toPascalCase(data.data);
        setCurrentUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lms_user', JSON.stringify(updatedUser));
        }
        await fetchData();
        return { success: true, user: updatedUser, message: data.message || 'Profile updated successfully.' };
      } else {
        return { success: false, message: data.message || 'Failed to update profile.' };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Server communication error.' };
    }
  };

  return (
    <LeaveContext.Provider value={{
      jwtToken,
      currentUser,
      login,
      logout,
      selectUser,
      users,
      requests,
      fetchPagedRequests,
      fetchPagedUsers,
      approvals,
      balances,
      leaveTypes,
      roles,
      statuses,
      calendarYears,
      loading,
      refreshData: fetchData,
      getAuthHeaders,
      addRequest,
      updateRequest,
      deleteRequest,
      approveRequest,
      rejectRequest,
      saveLookup,
      deleteLookup,
      approveUserAccount,
      updateUserProfile,
      
      // Shared modal states & handlers
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
      
      // Helpers
      getUserName,
      getLeaveTypeName,
      getStatusBadgeClass,
      getStatusName,
      
      // Handlers
      handleRequestSubmit,
      handleLeaveTypeSubmit,
      handleApprove,
      handleReject,
      handleDeleteLookup
    }}>
      {children}
    </LeaveContext.Provider>
  );
}
