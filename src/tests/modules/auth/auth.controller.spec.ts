import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { authController } from '../../../modules/auth/auth.controller';
import { AuthService } from '../../../modules/auth/auth.service';
import type { Request, Response } from 'express';

jest.mock('../../../modules/auth/auth.service');

describe('AuthController', () => {
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService = (authController as any).authService;
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn().mockReturnThis() as unknown as Response['json'],
      send: jest.fn().mockReturnThis() as unknown as Response['send'],
    };
    mockRequest = { body: {} };
  });

  describe('login', () => {
    it('login_WhenCredentialsAreValid_ShouldReturn200AndTokens', async () => {
        const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
        mockRequest.body = { email: 'test@example.com', password: 'password' };
        mockAuthService.login.mockResolvedValue(tokens);
        await authController.login(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(tokens);
    });
  });

  describe('register', () => {
    it('register_WhenDataIsValid_ShouldReturn201AndUserResponse', async () => {
      // Arrange
      const userData = { email: 'test@test.com', password: 'password' };
      const createdUser = { id: '123', email: 'test@test.com', role: { name: 'buyer' } };
      mockRequest.body = userData;
      (mockAuthService.register as any).mockResolvedValue(createdUser);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role.name,
        },
      });
    });
  });
  
  describe('refresh', () => {
    it('refresh_WhenRefreshTokenIsValid_ShouldReturn200AndNewToken', async () => {
      // Arrange
      const newAccessToken = { accessToken: 'new-token' };
      mockRequest.body = { refreshToken: 'valid-refresh-token' };
      (mockAuthService.refresh as any).mockReturnValue(newAccessToken);

      // Act
      await authController.refresh(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(newAccessToken);
    });
  });

  describe('logout', () => {
    it('logout_WhenCalled_ShouldReturn204', () => {
      // Act
      authController.logout(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});