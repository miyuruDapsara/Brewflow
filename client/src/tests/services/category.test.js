jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const { listCategories } = require('../../services/category');

describe('category service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('lists categories from the API', async () => {
    apiRequest.mockResolvedValue({
      categories: [{ id: '1', name: 'Drinks' }],
    });

    const result = await listCategories();

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/categories',
    });
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].name).toBe('Drinks');
  });
});
