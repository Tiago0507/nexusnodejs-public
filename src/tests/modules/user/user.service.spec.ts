import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UserService } from '../../../modules/user/user.service';
import User from '../../../modules/user/user.model';
import Role from '../../../modules/user/role.model';
import { ConflictError, BadRequestError, NotFoundError } from '../../../utils/errors/ApiError';
import bcrypt from 'bcryptjs';

jest.mock('../../../modules/user/user.model');
jest.mock('../../../modules/user/role.model');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  describe('createUser', () => {
    it('createUser_WhenEmailIsNotInUseAndRoleExists_ShouldCreateAndReturnUser', async () => {
      // Arrange
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer',
      };
      const mockRole = { _id: 'roleId123', name: 'buyer' };

      (User.findOne as any).mockResolvedValue(null);
      (Role.findOne as any).mockResolvedValue(mockRole);
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');

      const mockUserInstance = { ...userData, save: jest.fn() };
      (mockUserInstance.save as any).mockResolvedValue(mockUserInstance);
      (User as unknown as jest.Mock).mockImplementation(() => mockUserInstance);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(Role.findOne).toHaveBeenCalledWith({ name: userData.role.toLowerCase() });
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ email: userData.email }));
    });

    it('createUser_WhenEmailIsAlreadyInUse_ShouldThrowConflictError', async () => {
      // Arrange
      const userData = { email: 'test@example.com' } as any;
      (User.findOne as any).mockResolvedValue({ email: userData.email });

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ConflictError);
    });

    it('createUser_WhenRoleDoesNotExist_ShouldThrowBadRequestError', async () => {
      // Arrange
      const userData = { role: 'nonexistent-role' } as any;
      (User.findOne as any).mockResolvedValue(null);
      (Role.findOne as any).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(BadRequestError);
    });
  });

  describe('findUserById', () => {
    it('findUserById_WhenUserDoesNotExist_ShouldThrowNotFoundError', async () => {
      // Arrange
      const userId = 'non-existent-id';
      (User.findById as any).mockImplementation(() => ({
        populate: (jest.fn() as any).mockResolvedValue(null),
      }));

      // Act & Assert
      await expect(userService.findUserById(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('deleteUser_WhenUserDoesNotExist_ShouldThrowNotFoundError', async () => {
      // Arrange
      const userId = 'non-existent-id';
      (User.findByIdAndDelete as any).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAllUsers', () => {
    it('findAllUsers_WhenCalled_ShouldReturnArrayOfUsers', async () => {
      // Arrange
      const mockUsers = [{ email: 'a@a.com' }, { email: 'b@b.com' }];
      (User.find as any).mockImplementation(() => ({
        populate: (jest.fn() as any).mockResolvedValue(mockUsers),
      }));
      // Act
      const result = await userService.findAllUsers();
      // Assert
      expect(User.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findUserByEmail', () => {
    it('findUserByEmail_WhenUserExists_ShouldReturnUser', async () => {
      // Arrange
      const userEmail = 'test@example.com';
      const mockUser = { email: userEmail };
      (User.findOne as any).mockImplementation(() => ({
        populate: (jest.fn() as any).mockResolvedValue(mockUser),
      }));
      // Act
      const result = await userService.findUserByEmail(userEmail);
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userEmail.toLowerCase() });
      expect(result).toEqual(mockUser);
    });

    it('findUserByEmail_WhenUserDoesNotExist_ShouldThrowNotFoundError', async () => {
      // Arrange
      const userEmail = 'non-existent@example.com';
      (User.findOne as any).mockImplementation(() => ({
        populate: (jest.fn() as any).mockResolvedValue(null),
      }));
      // Act & Assert
      await expect(userService.findUserByEmail(userEmail)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('updateUser_WhenUserExists_ShouldUpdateAndReturnUser', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData = { firstName: 'Updated' };
      const updatedUser = { _id: userId, firstName: 'Updated' };
      (User.findByIdAndUpdate as any).mockImplementation(() => ({
        populate: (jest.fn() as any).mockResolvedValue(updatedUser),
      }));
      // Act
      const result = await userService.updateUser(userId, updateData);
      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
      expect(result).toEqual(updatedUser);
    });

    it('updateUser_WhenUserDoesNotExist_ShouldThrowNotFoundError', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const updateData = { firstName: 'Updated' };
      (User.findByIdAndUpdate as any).mockImplementation(() => ({
        populate: (jest.fn() as any).mockResolvedValue(null),
      }));
      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('deleteUser (Success Case)', () => {
    it('deleteUser_WhenUserExists_ShouldDeleteSuccessfully', async () => {
      // Arrange
      const userId = 'user-to-delete';
      (User.findByIdAndDelete as any).mockResolvedValue({ _id: userId });
      // Act
      const result = await userService.deleteUser(userId);
      // Assert
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
    });
  });
});