"use client";

import React, { useContext } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import LookupPanel from '../../components/LookupPanel';

export default function CalendarYearsPage() {
  const {
    calendarYears,
    saveLookup,
    handleDeleteLookup
  } = useContext(LeaveContext);

  const handleAdd = async () => {
    const name = prompt('Enter Calendar Year Name (e.g. CY-2026):');
    if (name) {
      const start = prompt('Enter Start Date (YYYY-MM-DD):', '2026-01-01');
      const end = prompt('Enter End Date (YYYY-MM-DD):', '2026-12-31');
      await saveLookup('calendarYears', {
        CalendarYearName: name,
        StartDate: new Date(start).toISOString(),
        EndDate: new Date(end).toISOString()
      });
    }
  };

  return (
    <LookupPanel
      type="calendarYears"
      data={calendarYears}
      onAdd={handleAdd}
      onDelete={handleDeleteLookup}
      getTitle={() => "Calendar Years Configuration"}
    />
  );
}
