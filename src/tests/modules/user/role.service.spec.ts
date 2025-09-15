import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { RoleService } from '../../../modules/user/role.service';
import Role from '../../../modules/user/role.model';
import User from '../../../modules/user/user.model';
import { ConflictError, NotFoundError } from '../../../utils/errors/ApiError';

jest.mock('../../../modules/user/role.model');
jest.mock('../../../modules/user/user.model');

describe('RoleService', () => {
  let roleService: RoleService;

  beforeEach(() => {
    jest.clearAllMocks();
    roleService = new RoleService();
  });

  describe('createRole', () => {
    it('createRole_WhenRoleNameIsUnique_ShouldCreateAndReturnRole', async () => {
      // Arrange
      const roleData = { name: 'new-role', permissions: ['read'] };
      (Role.findOne as any).mockResolvedValue(null);
      const mockRoleInstance = { ...roleData, save: jest.fn() };
      (mockRoleInstance.save as any).mockResolvedValue(mockRoleInstance);
      (Role as unknown as jest.Mock).mockImplementation(() => mockRoleInstance);

      // Act
      const result = await roleService.createRole(roleData);

      // Assert
      expect(Role.findOne).toHaveBeenCalledWith({ name: roleData.name.toLowerCase() });
      expect(mockRoleInstance.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ name: roleData.name }));
    });

    it('createRole_WhenRoleNameAlreadyExists_ShouldThrowConflictError', async () => {
      // Arrange
      const roleData = { name: 'existing-role', permissions: [] };
      (Role.findOne as any).mockResolvedValue({ name: 'existing-role' });

      // Act & Assert
      await expect(roleService.createRole(roleData)).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteRole', () => {
    it('deleteRole_WhenRoleIsNotInUse_ShouldDeleteSuccessfully', async () => {
      // Arrange
      const roleId = 'role-to-delete';
      (User.countDocuments as any).mockResolvedValue(0);
      (Role.findByIdAndDelete as any).mockResolvedValue({ _id: roleId });

      // Act
      await roleService.deleteRole(roleId);

      // Assert
      expect(User.countDocuments).toHaveBeenCalledWith({ role: roleId });
      expect(Role.findByIdAndDelete).toHaveBeenCalledWith(roleId);
    });

    it('deleteRole_WhenRoleIsInUse_ShouldThrowConflictError', async () => {
      // Arrange
      const roleId = 'role-in-use';
      (User.countDocuments as any).mockResolvedValue(5);

      // Act & Assert
      await expect(roleService.deleteRole(roleId)).rejects.toThrow(ConflictError);
    });
  });

  describe('findAllRoles', () => {
    it('findAllRoles_WhenCalled_ShouldReturnArrayOfRoles', async () => {
      // Arrange
      const mockRoles = [{ name: 'admin' }, { name: 'buyer' }];
      (Role.find as any).mockResolvedValue(mockRoles);

      // Act
      const result = await roleService.findAllRoles();

      // Assert
      expect(Role.find).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });
  });

  describe('findRoleById', () => {
    it('findRoleById_WhenRoleExists_ShouldReturnRole', async () => {
      // Arrange
      const roleId = 'role-123';
      const mockRole = { _id: roleId, name: 'admin' };
      (Role.findById as any).mockResolvedValue(mockRole);

      // Act
      const result = await roleService.findRoleById(roleId);

      // Assert
      expect(Role.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });

    it('findRoleById_WhenRoleDoesNotExist_ShouldThrowNotFoundError', async () => {
      // Arrange
      const roleId = 'non-existent-id';
      (Role.findById as any).mockResolvedValue(null);

      // Act & Assert
      await expect(roleService.findRoleById(roleId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateRole', () => {
    it('updateRole_WhenRoleExists_ShouldUpdateAndReturnRole', async () => {
      // Arrange
      const roleId = 'role-123';
      const updateData = { description: 'New description' };
      const updatedRole = { _id: roleId, name: 'admin', ...updateData };
      (Role.findByIdAndUpdate as any).mockResolvedValue(updatedRole);

      // Act
      const result = await roleService.updateRole(roleId, updateData);

      // Assert
      expect(Role.findByIdAndUpdate).toHaveBeenCalledWith(roleId, updateData, { new: true });
      expect(result).toEqual(updatedRole);
    });

    it('updateRole_WhenRoleDoesNotExist_ShouldThrowNotFoundError', async () => {
      // Arrange
      const roleId = 'non-existent-id';
      const updateData = { description: 'New description' };
      (Role.findByIdAndUpdate as any).mockResolvedValue(null);

      // Act & Assert
      await expect(roleService.updateRole(roleId, updateData)).rejects.toThrow(NotFoundError);
    });
  });
});