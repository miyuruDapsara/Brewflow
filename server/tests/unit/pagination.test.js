const {
  getPagination,
  buildPaginationMeta,
} = require('../../src/utils/pagination');

describe('pagination', () => {
  it('normalizes page and limit and computes skip', () => {
    expect(getPagination({ page: 2, limit: 10 })).toEqual({
      page: 2,
      limit: 10,
      skip: 10,
    });
  });

  it('clamps invalid values', () => {
    expect(getPagination({ page: 0, limit: 9999, maxLimit: 50 })).toEqual({
      page: 1,
      limit: 50,
      skip: 0,
    });
  });

  it('builds pagination metadata', () => {
    expect(buildPaginationMeta({ page: 2, limit: 10, total: 25 })).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });
});
