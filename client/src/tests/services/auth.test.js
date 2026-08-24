jest.mock('../../services/api', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = require('../../services/api');
const { login, register, me } = require('../../services/auth');

describe('auth service', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('posts login credentials', async () => {
    apiRequest.mockResolvedValue({
      user: { id: '1', email: 'a@example.com' },
      token: 'tok',
    });

    const result = await login({ email: 'a@example.com', password: 'secret12' });

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/auth/login',
      data: { email: 'a@example.com', password: 'secret12' },
    });
    expect(result.token).toBe('tok');
  });

  it('posts register payload', async () => {
    apiRequest.mockResolvedValue({
      user: { id: '1', name: 'Ada' },
      token: 'tok',
    });

    await register({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret12',
    });

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/auth/register',
      data: {
        name: 'Ada',
        email: 'ada@example.com',
        password: 'secret12',
      },
    });
  });

  it('loads the current user from /me', async () => {
    apiRequest.mockResolvedValue({
      user: { id: '1', name: 'Ada' },
    });

    const user = await me();

    expect(apiRequest).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/auth/me',
    });
    expect(user.name).toBe('Ada');
  });
});
