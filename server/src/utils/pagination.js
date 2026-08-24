function getPagination({ page = 1, limit = 20, maxLimit = 100 } = {}) {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, Number(limit) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit) || 0;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = {
  getPagination,
  buildPaginationMeta,
};
