import { useNavigate } from 'react-router-dom';

const SEVERITY_META = {
  LOW:      { color: '#22c55e', label: 'LOW' },
  MEDIUM:   { color: '#eab308', label: 'MED' },
  HIGH:     { color: '#f97316', label: 'HIGH' },
  CRITICAL: { color: '#ef4444', label: 'CRIT' },
};

const STATUS_META = {
  OPEN:         { color: '#ef4444' },
  INVESTIGATING:{ color: '#f97316' },
  CONTAINED:    { color: '#eab308' },
  RESOLVED:     { color: '#22c55e' },
};

const IncidentCard = ({ incident }) => {
  const navigate = useNavigate();
  const sev = SEVERITY_META[incident.severity] || SEVERITY_META.MEDIUM;
  const sta = STATUS_META[incident.status]    || STATUS_META.OPEN;

  return (
    <div
      className="incident-card"
      style={{ borderLeft: `3px solid ${sev.color}` }}
      onClick={() => navigate(`/incidents/${incident._id}`)}
    >
      <div className="card-header">
        <span className="card-severity" style={{ color: sev.color }}>{sev.label}</span>
        <span className="card-status"   style={{ color: sta.color }}>{incident.status}</span>
      </div>
      <h3 className="card-title">{incident.title}</h3>
      <p className="card-desc">{incident.description?.slice(0, 100) || '—'}</p>
      <div className="card-footer">
        <span>🎯 {incident.assignedTo}</span>
        <span>{incident.updates?.length || 0} updates</span>
        <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default IncidentCard;
