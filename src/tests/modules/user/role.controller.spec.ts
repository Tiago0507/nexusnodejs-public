import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { roleController } from '../../../modules/user/role.controller';
import { RoleService } from '../../../modules/user/role.service';
import type { Request, Response } from 'express';
import { ConflictError, NotFoundError } from '../../../utils/errors/ApiError';

jest.mock('../../../modules/user/role.service');

describe('RoleController', () => {
  let mockRoleService: jest.Mocked<RoleService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRoleService = (roleController as any).roleService;
    mockResponse = {
      status: jest.fn() as any,
      json: jest.fn() as any,
      send: jest.fn() as any,
    };
    (mockResponse.status as jest.Mock).mockReturnThis();
    (mockResponse.json as jest.Mock).mockReturnThis();
    
    mockRequest = {
      body: {},
      params: {},
    };
  });

  describe('getAllRoles', () => {
    it('getAllRoles_WhenCalled_ShouldReturn200AndRolesList', async () => {
        // Arrange
        const mockRoles = [{ name: 'admin' }, { name: 'buyer' }];
        (mockRoleService.findAllRoles as any).mockResolvedValue(mockRoles);
        // Act
        await roleController.getAllRoles(mockRequest as Request, mockResponse as Response);
        // Assert
        expect(mockRoleService.findAllRoles).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockRoles);
    });
  });

  describe('getRoleById', () => {
    it('getRoleById_WhenRoleExists_ShouldReturn200AndRole', async () => {
        // Arrange
        const roleId = 'role-123';
        const mockRole = { id: roleId, name: 'admin' };
        mockRequest.params = { id: roleId };
        (mockRoleService.findRoleById as any).mockResolvedValue(mockRole);
        // Act
        await roleController.getRoleById(mockRequest as Request, mockResponse as Response);
        // Assert
        expect(mockRoleService.findRoleById).toHaveBeenCalledWith(roleId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockRole);
    });
  });

  describe('createRole', () => {
    it('createRole_WhenDataIsValid_ShouldReturn201AndNewRole', async () => {
      // Arrange
      const roleData = { name: 'new-role', permissions: ['read'] };
      const newRole = { id: '123', ...roleData };
      mockRequest.body = roleData;
      (mockRoleService.createRole as any).mockResolvedValue(newRole);
      // Act
      await roleController.createRole(mockRequest as Request, mockResponse as Response);
      // Assert
      expect(mockRoleService.createRole).toHaveBeenCalledWith(roleData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newRole);
    });
  });

  describe('deleteRole', () => {
    it('deleteRole_WhenIdIsValid_ShouldCallServiceAndReturn204', async () => {
      // Arrange
      const roleId = 'role-id-123';
      mockRequest.params = { id: roleId };
      (mockRoleService.deleteRole as any).mockResolvedValue({});
      // Act
      await roleController.deleteRole(mockRequest as Request, mockResponse as Response);
      // Assert
      expect(mockRoleService.deleteRole).toHaveBeenCalledWith(roleId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('updateRole_WhenRoleExists_ShouldReturn200AndUpdatedRole', async () => {
        // Arrange
        const roleId = 'role-123';
        const updateData = { description: 'Updated Description' };
        const updatedRole = { id: roleId, name: 'admin', ...updateData };
        mockRequest.params = { id: roleId };
        mockRequest.body = updateData;
        (mockRoleService.updateRole as any).mockResolvedValue(updatedRole);

        // Act
        await roleController.updateRole(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockRoleService.updateRole).toHaveBeenCalledWith(roleId, updateData);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedRole);
    });

    it('updateRole_WhenIdIsMissing_ShouldReturn400', async () => {
        // Arrange
        mockRequest.params = {};

        // Act
        await roleController.updateRole(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
            })
        );
    });
  });

  describe('getRoleById (Error Cases)', () => {
    it('getRoleById_WhenRoleDoesNotExist_ShouldReturn404', async () => {
        // Arrange
        const roleId = 'non-existent-id';
        mockRequest.params = { id: roleId };
        const notFoundError = new NotFoundError('Rol no encontrado.');
        (mockRoleService.findRoleById as any).mockRejectedValue(notFoundError);

        // Act
        await roleController.getRoleById(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createRole (Error Cases)', () => {
    it('createRole_WhenRoleNameAlreadyExists_ShouldReturn409', async () => {
        // Arrange
        const roleData = { name: 'existing-role', permissions: [] };
        mockRequest.body = roleData;
        const conflictError = new ConflictError('Ya existe un rol con ese nombre.');
        (mockRoleService.createRole as any).mockRejectedValue(conflictError);

        // Act
        await roleController.createRole(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(409);
    });
  });
});