import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../modules/auth/auth.service';
import { UserService } from '../../../modules/user/user.service';
import { ApiError } from '../../../utils/errors/ApiError';
import type { UserDocument } from '../../../modules/user/user.model';

jest.mock('../../../modules/user/user.service');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = new UserService() as jest.Mocked<UserService>;
    authService = new AuthService(mockUserService);
  });

  describe('login', () => {
    it('login_WhenCredentialsAreCorrect_ShouldReturnTokens', async () => {
        // Arrange
        const loginDto = { email: 'test@test.com', password: 'password123' };
        const mockUser = {
            _id: '123',
            passwordHash: 'hashedPassword',
            role: { name: 'buyer' },
        } as unknown as UserDocument;
        (mockUserService.findUserByEmailWithPassword as any).mockResolvedValue(mockUser);
        (bcrypt.compare as any).mockResolvedValue(true);

        // Act
        const result = await authService.login(loginDto);

        // Assert
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('register', () => {
    it('register_WhenCalled_ShouldCallCreateUserInUserService', async () => {
      // Arrange
      const registerDto = { email: 'new@test.com', password: 'password' } as any;
      (mockUserService.createUser as any).mockResolvedValue({} as any);

      // Act
      await authService.register(registerDto);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('refresh', () => {
    it('refresh_WhenTokenIsValid_ShouldReturnNewAccessToken', () => {
        // Arrange
        const refreshToken = 'valid-refresh-token';
        const decodedPayload = { id: 'userId123' };
        const newAccessToken = 'new-access-token';
        (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);
        (jwt.sign as jest.Mock).mockReturnValue(newAccessToken);

        // Act
        const result = authService.refresh(refreshToken);

        // Assert
        expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET!);
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: decodedPayload.id },
            process.env.JWT_SECRET!,
            expect.any(Object)
        );
        expect(result.accessToken).toBe(newAccessToken);
    });

    it('refresh_WhenTokenIsInvalid_ShouldThrowApiError', () => {
        // Arrange
        const refreshToken = 'invalid-refresh-token';
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        // Act & Assert
        expect(() => authService.refresh(refreshToken)).toThrow(ApiError);
    });
  });
});