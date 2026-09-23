"use client";

import React, { useContext } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import LookupPanel from '../../components/LookupPanel';

export default function LeaveTypesPage() {
  const {
    leaveTypes,
    setShowLeaveTypeModal,
    setEditingLeaveType,
    handleDeleteLookup
  } = useContext(LeaveContext);

  return (
    <LookupPanel
      type="leaveTypes"
      data={leaveTypes}
      onAdd={() => {
        setEditingLeaveType(null);
        setShowLeaveTypeModal(true);
      }}
      onEdit={(item) => {
        setEditingLeaveType(item);
        setShowLeaveTypeModal(true);
      }}
      onDelete={handleDeleteLookup}
      getTitle={() => "Leave Types Configuration"}
    />
  );
}
