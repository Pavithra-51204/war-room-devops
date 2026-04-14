import { useIncidents } from '../context/IncidentContext';
import IncidentCard from './IncidentCard';

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const StatBox = ({ label, value, color }) => (
  <div className="stat-box" style={{ borderTop: `2px solid ${color}` }}>
    <span className="stat-value" style={{ color }}>{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const DashboardPage = () => {
  const { incidents, loading } = useIncidents();

  const byStatus = (s) => incidents.filter((i) => i.status === s).length;
  const bySev    = (s) => incidents.filter((i) => i.severity === s).length;

  const critical = incidents
    .filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  if (loading) return <div className="loader">Loading command feed…</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Command Overview</h1>

      <div className="stats-grid">
        <StatBox label="OPEN"         value={byStatus('OPEN')}          color="#ef4444" />
        <StatBox label="INVESTIGATING" value={byStatus('INVESTIGATING')} color="#f97316" />
        <StatBox label="CONTAINED"    value={byStatus('CONTAINED')}     color="#eab308" />
        <StatBox label="RESOLVED"     value={byStatus('RESOLVED')}      color="#22c55e" />
        <StatBox label="CRITICAL"     value={bySev('CRITICAL')}         color="#ef4444" />
        <StatBox label="HIGH"         value={bySev('HIGH')}             color="#f97316" />
      </div>

      <section className="dashboard-section">
        <h2>🔴 Active Critical Incidents</h2>
        {critical.length === 0
          ? <p className="empty-state">No active critical incidents. All clear.</p>
          : <div className="card-grid">{critical.map((i) => <IncidentCard key={i._id} incident={i} />)}</div>
        }
      </section>
    </div>
  );
};

export default DashboardPage;
