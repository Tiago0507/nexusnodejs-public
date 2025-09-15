import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { userController } from '../../../modules/user/user.controller';
import { UserService } from '../../../modules/user/user.service';
import type { Request, Response } from 'express';

jest.mock('../../../modules/user/user.service');

describe('UserController', () => {
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = (userController as any).userService;
    mockResponse = {
      status: jest.fn() as any,
      json: jest.fn() as any,
      send: jest.fn() as any,
    };
    (mockResponse.status as jest.Mock).mockReturnThis();
    (mockResponse.json as jest.Mock).mockReturnThis();

    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
  });

  describe('getAllUsers', () => {
    it('getAllUsers_WhenCalled_ShouldReturn200AndUserList', async () => {
      // Arrange
      const mockUsers = [{ id: '1', email: 'a@a.com' }, { id: '2', email: 'b@b.com' }];
      (mockUserService.findAllUsers as any).mockResolvedValue(mockUsers);
      // Act
      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);
      // Assert
      expect(mockUserService.findAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('getUserById_WhenUserExists_ShouldReturn200AndUser', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = { id: userId, email: 'test@test.com' };
      mockRequest.params = { id: userId };
      (mockUserService.findUserById as any).mockResolvedValue(mockUser);
      // Act
      await userController.getUserById(mockRequest as Request, mockResponse as Response);
      // Assert
      expect(mockUserService.findUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });
  
  describe('updateCurrentUser', () => {
    it('updateCurrentUser_WhenUserIsAuth_ShouldReturn200AndUpdatedUser', async () => {
        // Arrange
        const authUser = { id: 'auth-user-id', email: 'current@user.com' };
        const updateData = { firstName: 'UpdatedName' };
        const updatedUser = { ...authUser, ...updateData };
        mockRequest.user = authUser;
        mockRequest.body = updateData;
        (mockUserService.updateUser as any).mockResolvedValue(updatedUser);
        // Act
        await userController.updateCurrentUser(mockRequest as Request, mockResponse as Response);
        // Assert
        expect(mockUserService.updateUser).toHaveBeenCalledWith(
          authUser.id,
          expect.objectContaining({ firstName: updateData.firstName, })
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('getCurrentUser', () => {
    it('getCurrentUser_WhenUserIsOnRequest_ShouldReturn200AndUserObject', async () => {
      // Arrange
      const mockUser = { id: '123', email: 'test@example.com' };
      mockRequest.user = mockUser;
      // Act
      await userController.getCurrentUser(mockRequest as Request, mockResponse as Response);
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('deleteUser_WhenIdIsValid_ShouldCallServiceAndReturn204', async () => {
      // Arrange
      const userId = 'user-to-delete';
      mockRequest.params = { id: userId };
      (mockUserService.deleteUser as any).mockResolvedValue({});
      // Act
      await userController.deleteUser(mockRequest as Request, mockResponse as Response);
      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('getUserByEmail_WhenEmailExists_ShouldReturn200AndUser', async () => {
      // Arrange
      const userEmail = 'test@example.com';
      const mockUser = { id: '123', email: userEmail };
      mockRequest.query = { email: userEmail };
      (mockUserService.findUserByEmail as any).mockResolvedValue(mockUser);

      // Act
      await userController.getUserByEmail(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(userEmail);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('getUserByEmail_WhenEmailIsMissing_ShouldReturn400', async () => {
      // Arrange
      mockRequest.query = { email: undefined };

      // Act
      await userController.getUserByEmail(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        })
      );
    });
  });

  it('createUser_WithValidData_ShouldReturn201AndNewUser', async () => {
    // Arrange
    const userData = { 
        firstName: 'New', 
        lastName: 'User', 
        email: 'new@user.com', 
        password: 'password', 
        role: 'buyer' 
    };
    const createdUser = { id: 'new-id', ...userData };
    mockRequest.body = userData;
    (mockUserService.createUser as any).mockResolvedValue(createdUser);

    // Act
    await userController.createUser(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
  });

  describe('updateUser', () => {
    it('updateUser_WhenUserExists_ShouldReturn200AndUpdatedUser', async () => {
      // Arrange
      const userId = 'user-to-update';
      const updateData = { firstName: 'NewName' };
      const updatedUser = { id: userId, ...updateData };
      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
      (mockUserService.updateUser as any).mockResolvedValue(updatedUser);

      // Act
      await userController.updateUser(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    it('updateUser_WhenIdIsMissing_ShouldReturn400', async () => {
      // Arrange
      mockRequest.params = { id: '' };

      // Act
      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        })
      );
    });
  });
});