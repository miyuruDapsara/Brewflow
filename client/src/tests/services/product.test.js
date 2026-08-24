jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const { listProducts, getProduct } = require('../../services/product');

describe('product service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('lists products without a category filter', async () => {
    apiRequest.mockResolvedValue({
      products: [{ id: 'p1', name: 'Latte' }],
    });

    const result = await listProducts();

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/products',
      params: {},
    });
    expect(result.products[0].name).toBe('Latte');
  });

  it('lists products filtered by categoryId', async () => {
    apiRequest.mockResolvedValue({ products: [] });

    await listProducts({ categoryId: 'cat-1' });

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/products',
      params: { categoryId: 'cat-1' },
    });
  });

  it('loads a single product by id', async () => {
    apiRequest.mockResolvedValue({
      product: { id: 'p1', name: 'Espresso' },
    });

    const result = await getProduct('p1');

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/products/p1',
    });
    expect(result.product.name).toBe('Espresso');
  });
});
