import { Chip } from '@mui/material';

const ROUTE_STATUS = {
  PLANNED:     { label: 'Planifiée',  color: 'warning' },
  IN_PROGRESS: { label: 'En cours',   color: 'info'    },
  COMPLETED:   { label: 'Terminée',   color: 'success' },
  CANCELLED:   { label: 'Annulée',    color: 'error'   },
};

const DELIVERY_STATUS = {
  PENDING:     { label: 'En attente', color: 'default' },
  IN_PROGRESS: { label: 'En cours',   color: 'info'    },
  COMPLETED:   { label: 'Livré',      color: 'success' },
  FAILED:      { label: 'Échoué',     color: 'error'   },
};

export default function StatusChip({ status, type = 'route', size = 'small' }) {
  const map = type === 'delivery' ? DELIVERY_STATUS : ROUTE_STATUS;
  const config = map[status] ?? { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size={size} />;
}
