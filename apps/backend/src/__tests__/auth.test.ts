import jwt from 'jsonwebtoken';
import { createAuthContext, pairingMiddleware, jwtAuthMiddleware } from '../core/auth';

jest.mock('../ui/statusBar', () => ({ updateStatusBar: jest.fn() }));

describe('auth utilities', () => {
  test('createAuthContext generates tokens', () => {
    const ctx = createAuthContext();
    expect(typeof ctx.jwtSecret).toBe('string');
    expect(ctx.jwtSecret.length).toBeGreaterThan(0);
    expect(typeof ctx.pairingToken).toBe('string');
    expect(ctx.pairingToken.length).toBeGreaterThan(0);
    expect(ctx.isPaired).toBe(false);
  });

  test('pairingMiddleware pairs once and returns token', () => {
    const ctx = { jwtSecret: 'test-secret-key-32-chars-long', pairingToken: 'TOKEN', isPaired: false };
    const req: any = { body: { operationName: 'pairWithServer', variables: { pairingToken: 'TOKEN' } } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();
    pairingMiddleware(ctx)(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        pairWithServer: expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/)
      })
    }));
    expect(ctx.isPaired).toBe(true);
  });

  test('pairingMiddleware rejects invalid token', () => {
    const ctx = { jwtSecret: 'test-secret-key-32-chars-long', pairingToken: 'TOKEN', isPaired: false };
    const req: any = { body: { operationName: 'pairWithServer', variables: { pairingToken: 'WRONG' } } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();
    pairingMiddleware(ctx)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(ctx.isPaired).toBe(false);
  });

  test('jwtAuthMiddleware validates token', () => {
    const ctx = { jwtSecret: 'abcdefghijklmnopqrstuvwxyz123456', pairingToken: '', isPaired: true };
    const token = jwt.sign({ ok: true }, ctx.jwtSecret);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();
    jwtAuthMiddleware(ctx)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  test('jwtAuthMiddleware rejects invalid token', () => {
    const ctx = { jwtSecret: 'test-secret-key-32-chars-long', pairingToken: '', isPaired: true };
    const req: any = { headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid.signature' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();
    jwtAuthMiddleware(ctx)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
