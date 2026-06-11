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

const ALERT_PRIORITY = {
  LOW:      { label: 'Faible',    color: 'default' },
  MEDIUM:   { label: 'Moyen',     color: 'warning' },
  HIGH:     { label: 'Élevé',     color: 'error'   },
  CRITICAL: { label: 'Critique',  color: 'error'   },
};

const ALERT_STATUS = {
  NEW:         { label: 'Nouveau',     color: 'warning' },
  IN_PROGRESS: { label: 'En cours',    color: 'info'    },
  RESOLVED:    { label: 'Résolu',      color: 'success' },
  CLOSED:      { label: 'Fermé',       color: 'default' },
};

const MAPS = {
  route:          ROUTE_STATUS,
  delivery:       DELIVERY_STATUS,
  'alert-priority': ALERT_PRIORITY,
  'alert-status':   ALERT_STATUS,
};

export default function StatusChip({ status, type = 'route', size = 'small' }) {
  const map = MAPS[type] ?? ROUTE_STATUS;
  const config = map[status] ?? { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size={size} />;
}
