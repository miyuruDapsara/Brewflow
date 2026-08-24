const logger = require('../../src/utils/logger');

describe('logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes info messages with an INFO prefix', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('hello', { a: 1 });

    expect(spy).toHaveBeenCalledWith('[INFO] hello {"a":1}');
  });

  it('writes error messages with an ERROR prefix', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('failed');

    expect(spy).toHaveBeenCalledWith('[ERROR] failed');
  });
});
