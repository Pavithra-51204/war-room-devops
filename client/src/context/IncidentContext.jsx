import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { incidentService } from '../services/incidentService';
import { useSocket } from '../hooks/useSocket';

const IncidentContext = createContext(null);

export const IncidentProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const socket = useSocket();

  // Initial data fetch
  const fetchAll = useCallback(async (filters) => {
    try {
      setLoading(true);
      const { data } = await incidentService.getAll(filters);
      setIncidents(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Real-time socket listeners ──────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onCreated = (incident) =>
      setIncidents((prev) => [incident, ...prev]);

    const onUpdated = (incident) =>
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? incident : i)));

    const onDeleted = ({ _id }) =>
      setIncidents((prev) => prev.filter((i) => i._id !== _id));

    socket.on('INCIDENT_CREATED',      onCreated);
    socket.on('INCIDENT_UPDATED',      onUpdated);
    socket.on('INCIDENT_UPDATE_ADDED', onUpdated);
    socket.on('INCIDENT_DELETED',      onDeleted);

    return () => {
      socket.off('INCIDENT_CREATED',      onCreated);
      socket.off('INCIDENT_UPDATED',      onUpdated);
      socket.off('INCIDENT_UPDATE_ADDED', onUpdated);
      socket.off('INCIDENT_DELETED',      onDeleted);
    };
  }, [socket]);

  const createIncident = useCallback(async (data) => {
    const res = await incidentService.create(data);
    return res.data.data;
  }, []);

  const updateIncident = useCallback(async (id, data) => {
    const res = await incidentService.update(id, data);
    return res.data.data;
  }, []);

  const deleteIncident = useCallback(async (id) => {
    await incidentService.remove(id);
  }, []);

  return (
    <IncidentContext.Provider
      value={{ incidents, loading, error, fetchAll, createIncident, updateIncident, deleteIncident }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error('useIncidents must be used within <IncidentProvider>');
  return ctx;
};
