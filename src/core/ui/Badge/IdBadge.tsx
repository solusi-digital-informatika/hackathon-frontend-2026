import React from 'react';

interface IdBadgeProps {
  id: string;
}

export const IdBadge: React.FC<IdBadgeProps> = ({ id }) => {
  return (
    <span className="badge-id" aria-label={`Project ID: ${id}`}>
      ID: {id}
    </span>
  );
};
