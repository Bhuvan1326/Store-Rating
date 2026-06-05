import React from 'react';

interface SortableThProps {
  label: string;
  field: string;
  currentSort: { field: string; order: 'asc' | 'desc' };
  onSort: (field: string) => void;
}

export default function SortableTh({ label, field, currentSort, onSort }: SortableThProps) {
  const isActive = currentSort.field === field;
  return (
    <th className={isActive ? 'sorted' : ''} onClick={() => onSort(field)}>
      {label}
      <span className="sort-icon">
        {isActive ? (currentSort.order === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
      </span>
    </th>
  );
}
