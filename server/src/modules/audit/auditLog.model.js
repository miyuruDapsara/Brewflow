const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    actorId: this.actorId ? this.actorId.toString() : null,
    action: this.action,
    entityType: this.entityType,
    entityId: this.entityId,
    details: this.details || {},
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
