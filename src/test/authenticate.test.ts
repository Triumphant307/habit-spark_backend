import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Set environment variable for testing before importing anything that might use it
const SECRET = 'test-secret';
process.env.JWT_SECRET = SECRET;

// We still use dynamic imports to be safe with process.env changes
const { authenticate } = await import('../middleware/authenticate.js');

export interface AuthRequest extends Request {
  userId?: string;
}

describe('Authenticate Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn() as unknown as Response['json'],
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() and attach userId if a valid token is provided', () => {
    const userId = 'user-123';
    const token = jwt.sign({ userId }, SECRET);
    mockRequest.headers = { authorization: `Bearer ${token}` };

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.userId).toBe(userId);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 if no authorization header is present', () => {
    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized: No token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if the token format is invalid (not Bearer)', () => {
    mockRequest.headers = { authorization: 'InvalidFormat abc' };

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized: No token provided',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails (invalid token)', () => {
    mockRequest.headers = { authorization: `Bearer invalid-token` };

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized: Invalid or expired token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is signed with a different secret', () => {
    const token = jwt.sign({ userId: '123' }, 'wrong-secret');
    mockRequest.headers = { authorization: `Bearer ${token}` };

    authenticate(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized: Invalid or expired token',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
