import type { RoleDocument } from "../user/role.model";
import { ConflictError, NotFoundError } from "../../utils/errors/ApiError";
import type { CreateRoleDto } from "./dto/create-role.dto";
import type { UpdateRoleDto } from "./dto/update-role.dto";
import User from "./user.model";
import Role from "./role.model";

export class RoleService {
  public async findAllRoles(): Promise<RoleDocument[]> {
    return Role.find();
  }

  public async findRoleById(id: string): Promise<RoleDocument> {
    const role = await Role.findById(id);
    if (!role) {
      throw new NotFoundError("Rol no encontrado.");
    }
    return role;
  }

  public async createRole(roleData: CreateRoleDto): Promise<RoleDocument> {
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

  public async updateRole(
    id: string,
    roleData: UpdateRoleDto
  ): Promise<RoleDocument> {
    const updatedRole = await Role.findByIdAndUpdate(id, roleData, {
      new: true,
    });
    if (!updatedRole) {
      throw new NotFoundError("Rol no encontrado.");
    }
    return updatedRole;
  }

  public async deleteRole(id: string): Promise<RoleDocument> {
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
