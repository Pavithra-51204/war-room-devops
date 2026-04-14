const Incident = require('../models/Incident');

const CHANNEL = 'warroom:incidents';

class IncidentService {
  constructor(publisher) {
    // publisher = ioredis client used solely for PUBLISH
    this.publisher = publisher;
  }

  async getAll(filters = {}) {
    const query = {};
    if (filters.status)   query.status   = filters.status;
    if (filters.severity) query.severity = filters.severity;
    return Incident.find(query).sort({ createdAt: -1 }).lean();
  }

  async getById(id) {
    const inc = await Incident.findById(id).lean();
    if (!inc) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    return inc;
  }

  async create(data, userId) {
    const incident = await Incident.create({ ...data, createdBy: userId });
    await this._publish('INCIDENT_CREATED', incident);
    return incident;
  }

  async update(id, data) {
    const incident = await Incident.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    await this._publish('INCIDENT_UPDATED', incident);
    return incident;
  }

  async addUpdate(id, message, author) {
    const incident = await Incident.findByIdAndUpdate(
      id,
      { $push: { updates: { message, author } } },
      { new: true }
    );
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    await this._publish('INCIDENT_UPDATE_ADDED', incident);
    return incident;
  }

  async remove(id) {
    const incident = await Incident.findByIdAndDelete(id);
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    await this._publish('INCIDENT_DELETED', { _id: id });
    return { success: true };
  }

  async _publish(event, payload) {
    const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    await this.publisher.publish(CHANNEL, message);
  }
}

module.exports = { IncidentService, CHANNEL };
