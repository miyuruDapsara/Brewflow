const AuditLog = require('./auditLog.model');
const logger = require('../../utils/logger');
const {
  getPagination,
  buildPaginationMeta,
} = require('../../utils/pagination');

async function writeLog({
  actorId,
  action,
  entityType,
  entityId,
  details = {},
}) {
  if (!actorId || !action || !entityType || !entityId) {
    return null;
  }

  const doc = await AuditLog.create({
    actorId,
    action,
    entityType,
    entityId: String(entityId),
    details,
  });
  return doc.toSafeObject();
}

/**
 * Never fail the calling mutation if audit write fails.
 */
function writeLogSafe(payload) {
  return writeLog(payload).catch((err) => {
    logger.error('Audit write failed:', err.message);
  });
}

async function listLogs({
  page,
  limit,
  action,
  entityType,
  entityId,
} = {}) {
  const pagination = getPagination({ page, limit });
  const filter = {};
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;
  if (entityId) filter.entityId = String(entityId);

  const [rows, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs: rows.map((row) => row.toSafeObject()),
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
}

module.exports = {
  writeLog,
  writeLogSafe,
  listLogs,
};
