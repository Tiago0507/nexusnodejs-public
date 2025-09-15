import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { authorize, hasPermission } from '../../../../modules/auth/middlewares/authorization.middleware';
import type { Request, Response } from 'express';
import { ApiError } from '../../../../utils/errors/ApiError';

describe('Authorization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('authorize', () => {
    it('authorize_WhenUserRoleIsAllowed_ShouldCallNext', () => {
      // Arrange
      mockRequest.user = { role: { name: 'admin' } };
      const allowedRoles = ['admin', 'organizer'];
      const middleware = authorize(allowedRoles);
      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('authorize_WhenUserRoleIsNotAllowed_ShouldCallNextWithForbiddenError', () => {
      // Arrange
      mockRequest.user = { role: { name: 'buyer' } };
      const allowedRoles = ['admin', 'organizer'];
      const middleware = authorize(allowedRoles);
      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0]![0] as ApiError;
      expect(error.statusCode).toBe(403);
    });

    it('authorize_WhenUserIsNotOnRequest_ShouldCallNextWithAuthError', () => {
      // Arrange
      mockRequest.user = undefined;
      const middleware = authorize(['admin']);
      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0]![0] as ApiError;
      expect(error.statusCode).toBe(401);
    });
  });

  describe('hasPermission', () => {
    it('hasPermission_WhenUserHasRequiredPermission_ShouldCallNext', async () => {
      // Arrange
      const requiredPermission = 'create:events';
      mockRequest.user = {
        hasPermission: (jest.fn() as any).mockResolvedValue(true),
      };
      const middleware = hasPermission(requiredPermission);

      // Act
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.user.hasPermission).toHaveBeenCalledWith(requiredPermission);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('hasPermission_WhenUserLacksPermission_ShouldCallNextWithForbiddenError', async () => {
      // Arrange
      const requiredPermission = 'delete:users';
      mockRequest.user = {
        hasPermission: (jest.fn() as any).mockResolvedValue(false),
      };
      const middleware = hasPermission(requiredPermission);

      // Act
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0]![0] as ApiError;
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain(requiredPermission);
    });

    it('hasPermission_WhenUserIsNotOnRequest_ShouldCallNextWithAuthError', async () => {
      // Arrange
      mockRequest.user = undefined;
      const middleware = hasPermission('any:permission');

      // Act
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0]![0] as ApiError;
      expect(error.statusCode).toBe(401);
    });
  });
});