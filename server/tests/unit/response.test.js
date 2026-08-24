const { sendSuccess, sendMessage } = require('../../src/utils/response');

describe('response helpers', () => {
  function mockRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  it('sendSuccess returns a success envelope', () => {
    const res = mockRes();

    sendSuccess(res, { id: 1 }, 201);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ success: true, data: { id: 1 } });
  });

  it('sendMessage returns a message envelope', () => {
    const res = mockRes();

    sendMessage(res, 'ok');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'ok' });
  });
});
