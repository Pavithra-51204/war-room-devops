import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentService } from '../services/incidentService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES   = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'];

const IncidentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [newMsg, setNewMsg]     = useState('');
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    incidentService.getById(id)
      .then(({ data }) => setIncident(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  // Join specific incident room for targeted updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('JOIN_INCIDENT', id);
    return () => socket.emit('LEAVE_INCIDENT', id);
  }, [socket, id]);

  // Live update listener (also handled globally in context, but detail page re-renders live)
  useEffect(() => {
    if (!socket) return;
    const handler = (updated) => { if (updated._id === id) setIncident(updated); };
    socket.on('INCIDENT_UPDATED',      handler);
    socket.on('INCIDENT_UPDATE_ADDED', handler);
    return () => { socket.off('INCIDENT_UPDATED', handler); socket.off('INCIDENT_UPDATE_ADDED', handler); };
  }, [socket, id]);

  const handleStatusChange = async (status) => {
    const { data } = await incidentService.update(id, { status });
    setIncident(data.data);
  };

  const handleSeverityChange = async (severity) => {
    const { data } = await incidentService.update(id, { severity });
    setIncident(data.data);
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const { data } = await incidentService.addUpdate(id, newMsg.trim());
      setIncident(data.data);
      setNewMsg('');
    } finally {
      setSending(false);
    }
  };

  if (loading)   return <div className="loader">Loading incident…</div>;
  if (!incident) return <div className="empty-state">Incident not found.</div>;

  return (
    <div className="incident-detail">
      <button className="btn-back" onClick={() => navigate('/incidents')}>← Back</button>

      <div className="detail-header">
        <h1>{incident.title}</h1>
        <div className="detail-controls">
          <select value={incident.severity} onChange={(e) => handleSeverityChange(e.target.value)}>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={incident.status} onChange={(e) => handleStatusChange(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <p className="detail-desc">{incident.description || 'No description provided.'}</p>

      <div className="detail-meta">
        <span>Assigned: <strong>{incident.assignedTo || 'Unassigned'}</strong></span>
        <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
      </div>

      <section className="updates-section">
        <h2>Situation Updates ({incident.updates?.length || 0})</h2>
        <div className="updates-list">
          {incident.updates?.length === 0 && <p className="empty-state">No updates yet.</p>}
          {[...(incident.updates || [])].reverse().map((u, idx) => (
            <div key={idx} className="update-item">
              <div className="update-meta">
                <strong>{u.author}</strong>
                <span>{new Date(u.createdAt).toLocaleString()}</span>
              </div>
              <p>{u.message}</p>
            </div>
          ))}
        </div>

        <form className="update-form" onSubmit={handleAddUpdate}>
          <textarea
            rows={2} placeholder="Post situation update…"
            value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={sending || !newMsg.trim()}>
            {sending ? 'Posting…' : 'Post Update'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default IncidentDetailPage;
