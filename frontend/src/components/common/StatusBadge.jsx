import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (st) => {
    switch (st?.toLowerCase()) {
      case 'pending':
        return 'badge-pending';
      case 'accepted':
        return 'badge-accepted';
      case 'approved':
      case 'completed':
      case 'active':
        return 'badge-approved';
      case 'rejected':
      case 'cancelled':
      case 'inactive':
        return 'badge-rejected';
      default:
        return 'badge-pending';
    }
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{status}</span>;
};

export default StatusBadge;
