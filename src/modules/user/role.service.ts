import type { RoleDocument } from "../user/role.model";
import { ConflictError, NotFoundError } from "../../utils/errors/ApiError";
import type { CreateRoleDto } from "./dto/create-role.dto";
import type { UpdateRoleDto } from "./dto/update-role.dto";
import User from "./user.model";
import Role from "./role.model";

/**
 * Service class that encapsulates business logic for role management.
 * It handles interactions with the Role and User database models.
 */
export class RoleService {
  /**
   * Retrieves all roles from the database.
   * @returns {Promise<RoleDocument[]>} A promise that resolves to an array of role documents.
   */
  public async findAllRoles(): Promise<RoleDocument[]> {
    return Role.find();
  }

  /**
   * Finds a single role by its unique identifier.
   * @param {string} id - The ID of the role to find.
   * @returns {Promise<RoleDocument>} A promise that resolves to the found role document.
   * @throws {NotFoundError} If no role with the given ID is found.
   */
  public async findRoleById(id: string): Promise<RoleDocument> {
    const role = await Role.findById(id);
    if (!role) {
      throw new NotFoundError("Rol no encontrado.");
    }
    return role;
  }

  /**
   * Creates a new role in the database.
   * It ensures that the role name is unique before creation.
   * @param {CreateRoleDto} roleData - The data for the new role.
   * @returns {Promise<RoleDocument>} A promise that resolves to the newly created role document.
   * @throws {ConflictError} If a role with the same name already exists.
   */
  public async createRole(roleData: CreateRoleDto): Promise<RoleDocument> {
    // Checks for an existing role with the same name to prevent duplicates.
    const existingRole = await Role.findOne({
      name: roleData.name.toLowerCase(),
    });
    if (existingRole) {
      throw new ConflictError("Ya existe un rol con ese nombre.");
    }

    const newRole = new Role(roleData);
    await newRole.save();
    return newRole;
  }

  /**
   * Finds a role by its ID and updates it with new data.
   * @param {string} id - The ID of the role to update.
   * @param {UpdateRoleDto} roleData - The new data for the role.
   * @returns {Promise<RoleDocument>} A promise that resolves to the updated role document.
   * @throws {NotFoundError} If no role with the given ID is found.
   */
  public async updateRole(
    id: string,
    roleData: UpdateRoleDto
  ): Promise<RoleDocument> {
    // Options { new: true } ensures the updated document is returned.
    const updatedRole = await Role.findByIdAndUpdate(id, roleData, {
      new: true,
    });
    if (!updatedRole) {
      throw new NotFoundError("Rol no encontrado.");
    }
    return updatedRole;
  }

  /**
   * Deletes a role by its ID.
   * It performs a check to ensure the role is not currently assigned to any users before deletion.
   * @param {string} id - The ID of the role to delete.
   * @returns {Promise<RoleDocument>} A promise that resolves to the deleted role document.
   * @throws {ConflictError} If the role is assigned to one or more users.
   * @throws {NotFoundError} If no role with the given ID is found.
   */
  public async deleteRole(id: string): Promise<RoleDocument> {
    // Prevents deletion if the role is in use by any user.
    const userCount = await User.countDocuments({ role: id });
    if (userCount > 0) {
      throw new ConflictError(
        "No se puede eliminar el rol porque está asignado a uno o más usuarios."
      );
    }

    const deletedRole = await Role.findByIdAndDelete(id);
    if (!deletedRole) {
      throw new NotFoundError("Rol no encontrado.");
    }
    return deletedRole;
  }
}