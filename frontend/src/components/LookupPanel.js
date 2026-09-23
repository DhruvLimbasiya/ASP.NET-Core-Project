"use client";

import React from 'react';
import { Plus } from 'lucide-react';

export default function LookupPanel({ type, data, onAdd, onEdit, onDelete, getTitle }) {
  return (
    <div className="panel-card" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="panel-header">
        <h3 className="panel-title">{getTitle()}</h3>
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus size={16} /> Add New
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            {type === 'leaveTypes' && (
              <tr>
                <th>ID</th>
                <th>Type Name</th>
                <th>CSS class</th>
                <th>Actions</th>
              </tr>
            )}
            {type === 'roles' && (
              <tr>
                <th>Role ID</th>
                <th>Role Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            )}
            {type === 'statuses' && (
              <tr>
                <th>Status ID</th>
                <th>Status Name</th>
                <th>CSS Class</th>
                <th>Actions</th>
              </tr>
            )}
            {type === 'calendarYears' && (
              <tr>
                <th>Year ID</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.LeaveTypeId || item.RoleId || item.StatusId || item.CalendarYearId}>
                {type === 'leaveTypes' && (
                  <>
                    <td>#{item.LeaveTypeId}</td>
                    <td style={{ fontWeight: 700 }}>{item.TypeName}</td>
                    <td><code>{item.CssClass}</code></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {onEdit && (
                          <button
                            className="btn btn-outline"
                            onClick={() => onEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className="btn btn-outline"
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          onClick={() => onDelete('leaveTypes', item.LeaveTypeId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
                {type === 'roles' && (
                  <>
                    <td>#{item.RoleId}</td>
                    <td style={{ fontWeight: 700 }}>{item.RoleName}</td>
                    <td>{item.Description || '-'}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        onClick={() => onDelete('roles', item.RoleId)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
                {type === 'statuses' && (
                  <>
                    <td>#{item.StatusId}</td>
                    <td style={{ fontWeight: 700 }}>{item.StatusName}</td>
                    <td><code>{item.StatusCssClass}</code></td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        onClick={() => onDelete('statuses', item.StatusId)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
                {type === 'calendarYears' && (
                  <>
                    <td>#{item.CalendarYearId}</td>
                    <td style={{ fontWeight: 700 }}>{item.CalendarYearName}</td>
                    <td>{new Date(item.StartDate).toLocaleDateString()}</td>
                    <td>{new Date(item.EndDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        onClick={() => onDelete('calendarYears', item.CalendarYearId)}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '32px' }}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
