const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    author:  { type: String, required: true },
  },
  { timestamps: true }
);

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'],
      default: 'OPEN',
    },
    assignedTo: { type: String, default: 'Unassigned' },
    tags: [{ type: String, trim: true }],
    updates: [updateSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

incidentSchema.index({ severity: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
