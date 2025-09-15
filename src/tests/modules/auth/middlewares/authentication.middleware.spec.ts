import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { authenticate } from '../../../../modules/auth/middlewares/authentication.middleware';
import { UserService } from '../../../../modules/user/user.service';
import type { UserDocument } from '../../../../modules/user/user.model';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

jest.mock('../../../../modules/user/user.service', () => {
  const mUserServiceInstance = {
    findUserById: jest.fn(),
  };
  return {
    UserService: jest.fn().mockImplementation(() => mUserServiceInstance),
  };
});

jest.mock('jsonwebtoken');
const MockedUserService = UserService as jest.Mock;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockUserServiceInstance: jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserServiceInstance = new MockedUserService() as jest.Mocked<UserService>;
    
    mockRequest = { header: jest.fn() as any };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('authenticate_WithValidToken_ShouldAttachUserAndCallNext', async () => {
    // Arrange
    const token = 'valid-token';
    const decodedPayload = { id: 'userId123' };
    const mockUser: Partial<UserDocument> = { id: 'userId123', firstName: 'Test' };

    (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);
    (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);
    (mockUserServiceInstance.findUserById as any).mockResolvedValue(mockUser);

    // Act
    await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalledWith();
  });
});