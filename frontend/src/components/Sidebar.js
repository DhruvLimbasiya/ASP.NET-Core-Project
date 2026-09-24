import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, LayoutDashboard, Clock, Layers, Users, UserCheck, CalendarDays, UserCog, User } from 'lucide-react';

export default function Sidebar({ isManager, isSystemAdmin, currentUser }) {
  const pathname = usePathname();

  const userRoleName = currentUser?.Role?.RoleName?.toUpperCase() || (currentUser?.RoleId === 1 ? 'MANAGER' : currentUser?.RoleId === 3 ? 'SYSTEM ADMINISTRATOR' : 'EMPLOYEE');
  const sysAdmin = isSystemAdmin !== undefined ? isSystemAdmin : (currentUser?.RoleId === 3 || userRoleName === 'SYSTEM ADMINISTRATOR' || userRoleName === 'SYSADMIN' || userRoleName === 'SYSTEM ADMIN');

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        <Calendar size={22} style={{ color: 'var(--primary)' }} />
        <span>LMS Portal</span>
      </Link>

      <ul className="sidebar-menu">
        <li>
          <Link
            href="/dashboard"
            className={`sidebar-item ${pathname === '/dashboard' || pathname === '/' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        </li>
        
        <li>
          <Link
            href="/profile"
            className={`sidebar-item ${pathname === '/profile' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>
        </li>

        {!isManager && (
          <li>
            <Link
              href="/balances"
              className={`sidebar-item ${pathname === '/balances' ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <CalendarDays size={18} />
              <span>Leave Balances</span>
            </Link>
          </li>
        )}

        <li>
          <Link
            href="/requests"
            className={`sidebar-item ${pathname === '/requests' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Clock size={18} />
            <span>Leave Requests</span>
          </Link>
        </li>

        {isManager && (
          <>
            {sysAdmin && (
              <li>
                <Link
                  href="/managers"
                  className={`sidebar-item ${pathname === '/managers' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <UserCog size={18} />
                  <span>Managers</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/employees"
                className={`sidebar-item ${pathname === '/employees' ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Users size={18} />
                <span>Employees</span>
              </Link>
            </li>
            <li>
              <Link
                href="/leave-types"
                className={`sidebar-item ${pathname === '/leave-types' ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Layers size={18} />
                <span>Leave Types</span>
              </Link>
            </li>
            {sysAdmin && (
              <li>
                <Link
                  href="/roles"
                  className={`sidebar-item ${pathname === '/roles' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <UserCheck size={18} />
                  <span>Roles</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/statuses"
                className={`sidebar-item ${pathname === '/statuses' ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <UserCheck size={18} />
                <span>Statuses</span>
              </Link>
            </li>
            <li>
              <Link
                href="/calendar-years"
                className={`sidebar-item ${pathname === '/calendar-years' ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <CalendarDays size={18} />
                <span>Calendar Years</span>
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}
