import {
  handleBullBoardAuth,
  timingSafeStringEqual,
  MinimalReply,
} from './bull-board-auth.hook';

describe('bull-board-auth.hook', () => {
  describe('timingSafeStringEqual', () => {
    it('should return true for matching strings', () => {
      expect(timingSafeStringEqual('admin', 'admin')).toBe(true);
      expect(timingSafeStringEqual('secret123', 'secret123')).toBe(true);
    });

    it('should return false for non-matching strings', () => {
      expect(timingSafeStringEqual('admin', 'wrong')).toBe(false);
      expect(timingSafeStringEqual('short', 'longer-string')).toBe(false);
    });
  });

  describe('handleBullBoardAuth', () => {
    const validUser = 'admin';
    const validPass = 'supersecret';
    const validBase64 = Buffer.from(`${validUser}:${validPass}`).toString(
      'base64',
    );

    let statusMock: jest.Mock;
    let headerMock: jest.Mock;
    let sendMock: jest.Mock;
    let mockReply: MinimalReply;

    beforeEach(() => {
      statusMock = jest.fn().mockImplementation(() => mockReply);
      headerMock = jest.fn().mockImplementation(() => mockReply);
      sendMock = jest.fn().mockImplementation(() => mockReply);

      mockReply = {
        status: statusMock,
        header: headerMock,
        send: sendMock,
      };
    });

    it('should allow non-admin requests to pass through untouched', () => {
      const req = {
        url: '/videos/process',
        headers: {},
      };

      const result = handleBullBoardAuth(req, mockReply, validUser, validPass);
      expect(result).toBe(true);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 500 when credentials are missing in env for admin route', () => {
      const req = {
        url: '/admin/queues',
        headers: {},
      };

      const result = handleBullBoardAuth(req, mockReply, undefined, undefined);
      expect(result).toBe(false);
      expect(statusMock).toHaveBeenCalledWith(500);
    });

    it('should return 401 when Authorization header is missing', () => {
      const req = {
        url: '/admin/queues',
        headers: {},
      };

      const result = handleBullBoardAuth(req, mockReply, validUser, validPass);
      expect(result).toBe(false);
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(headerMock).toHaveBeenCalledWith(
        'WWW-Authenticate',
        expect.stringContaining('Basic'),
      );
    });

    it('should return 401 when credentials format is invalid', () => {
      const req = {
        url: '/admin/queues/api/queues',
        headers: {
          authorization: `Basic ${Buffer.from('no-colon').toString('base64')}`,
        },
      };

      const result = handleBullBoardAuth(req, mockReply, validUser, validPass);
      expect(result).toBe(false);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 401 when username or password is incorrect', () => {
      const badBase64 = Buffer.from('admin:wrongpass').toString('base64');
      const req = {
        url: '/admin/queues',
        headers: {
          authorization: `Basic ${badBase64}`,
        },
      };

      const result = handleBullBoardAuth(req, mockReply, validUser, validPass);
      expect(result).toBe(false);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return true and not call reply when credentials match', () => {
      const req = {
        url: '/admin/queues',
        headers: {
          authorization: `Basic ${validBase64}`,
        },
      };

      const result = handleBullBoardAuth(req, mockReply, validUser, validPass);
      expect(result).toBe(true);
      expect(statusMock).not.toHaveBeenCalled();
      expect(sendMock).not.toHaveBeenCalled();
    });
  });
});
