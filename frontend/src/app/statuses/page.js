"use client";

import React, { useContext } from 'react';
import { LeaveContext } from '../../context/LeaveContext';
import LookupPanel from '../../components/LookupPanel';

export default function StatusesPage() {
  const {
    statuses,
    saveLookup,
    handleDeleteLookup
  } = useContext(LeaveContext);

  const handleAdd = async () => {
    const name = prompt('Enter Status Name (e.g. Approved):');
    if (name) {
      const css = prompt('Enter Css Class (e.g. status-approved):');
      await saveLookup('statuses', { StatusName: name, StatusCssClass: css });
    }
  };

  return (
    <LookupPanel
      type="statuses"
      data={statuses}
      onAdd={handleAdd}
      onDelete={handleDeleteLookup}
      getTitle={() => "Statuses Configuration"}
    />
  );
}
