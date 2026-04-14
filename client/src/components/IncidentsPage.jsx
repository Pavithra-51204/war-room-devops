import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '../context/IncidentContext';
import IncidentCard from './IncidentCard';

const STATUSES   = ['', 'OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'];
const SEVERITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const IncidentsPage = () => {
  const { incidents, loading, createIncident } = useIncidents();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ status: '', severity: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'HIGH', assignedTo: '' });
  const [creating, setCreating] = useState(false);

  const filtered = incidents.filter((i) => {
    if (filters.status   && i.status   !== filters.status)   return false;
    if (filters.severity && i.severity !== filters.severity) return false;
    return true;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const inc = await createIncident(form);
      setShowForm(false);
      setForm({ title: '', description: '', severity: 'HIGH', assignedTo: '' });
      navigate(`/incidents/${inc._id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="incidents-page">
      <div className="page-header">
        <h1 className="page-title">Incident Registry</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '+ New Incident'}
        </button>
      </div>

      {showForm && (
        <form className="incident-form" onSubmit={handleCreate}>
          <input name="title" placeholder="Incident title *" required value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea name="description" placeholder="Description…" rows={3} value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="form-row">
            <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}>
              {['LOW','MEDIUM','HIGH','CRITICAL'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Assigned to" value={form.assignedTo}
              onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creating…' : 'Deploy Incident'}
          </button>
        </form>
      )}

      <div className="filters">
        <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={filters.severity} onChange={(e) => setFilters((p) => ({ ...p, severity: e.target.value }))}>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s || 'All Severities'}</option>)}
        </select>
        <span className="filter-count">{filtered.length} incident{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading
        ? <div className="loader">Loading incidents…</div>
        : filtered.length === 0
          ? <div className="empty-state">No incidents match the current filters.</div>
          : <div className="card-grid">{filtered.map((i) => <IncidentCard key={i._id} incident={i} />)}</div>
      }
    </div>
  );
};

export default IncidentsPage;
