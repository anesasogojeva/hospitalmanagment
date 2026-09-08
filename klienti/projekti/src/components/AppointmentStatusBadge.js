import React from 'react';
import Badge from 'react-bootstrap/Badge';

const STATUS_VARIANTS = {
  Scheduled: 'primary',
  Completed: 'success',
  Cancelled: 'danger',
};

const AppointmentStatusBadge = ({ status }) => (
  <Badge bg={STATUS_VARIANTS[status] || 'secondary'}>{status || 'Unknown'}</Badge>
);

export default AppointmentStatusBadge;
