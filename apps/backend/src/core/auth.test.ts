import type { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { PAIRING_OPERATION_NAME, pairingMiddleware } from './auth';
import type { AuthContext, RequestWithUser } from './auth';

jest.mock('../ui/uiState', () => ({ setServerUiState: jest.fn() }));
jest.mock('../ui/logger', () => ({ logInfo: jest.fn(), logWarn: jest.fn() }));

function createResponse() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  return {
    response: { json, status } as unknown as Response,
    json,
    status,
  };
}

describe('pairingMiddleware', () => {
  const createContext = (): AuthContext => ({
    jwtSecret: 'test-secret',
    pairingToken: 'ABC123',
    isPaired: false,
  });

  it('handles the generated PairWithServer operation and returns a signed token', () => {
    const authContext = createContext();
    const request = {
      body: {
        operationName: PAIRING_OPERATION_NAME,
        variables: { pairingToken: authContext.pairingToken },
      },
    } as RequestWithUser;
    const { response, json } = createResponse();
    const next = jest.fn() as NextFunction;

    pairingMiddleware(authContext)(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(authContext.isPaired).toBe(true);
    expect(json).toHaveBeenCalledTimes(1);

    const payload = json.mock.calls[0][0] as { data: { pairWithServer: string } };
    expect(jwt.verify(payload.data.pairWithServer, authContext.jwtSecret)).toMatchObject({
      paired: true,
    });
  });

  it('passes non-pairing operations to JWT authentication', () => {
    const authContext = createContext();
    const request = {
      body: { operationName: 'ListWorkspaces', variables: {} },
    } as RequestWithUser;
    const { response, json, status } = createResponse();
    const next = jest.fn() as NextFunction;

    pairingMiddleware(authContext)(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it('rejects an invalid pairing token', () => {
    const authContext = createContext();
    const request = {
      body: {
        operationName: PAIRING_OPERATION_NAME,
        variables: { pairingToken: 'WRONG' },
      },
    } as RequestWithUser;
    const { response, json, status } = createResponse();
    const next = jest.fn() as NextFunction;

    pairingMiddleware(authContext)(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid pairing token' });
  });
});
