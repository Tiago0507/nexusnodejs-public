import bcrypt from "bcryptjs";
import type { UserDocument } from "./user.model";
import User from "./user.model";
import Role from "./role.model";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors/ApiError";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";

export class UserService {
  public async findAllUsers(): Promise<UserDocument[]> {
    return User.find().populate("role");
  }

  public async findUserById(id: string): Promise<UserDocument> {
    const user = await User.findById(id).populate("role");
    if (!user) {
      throw new NotFoundError("Usuario no encontrado.");
    }
    return user;
  }

  public async findUserByEmailWithPassword(
    email: string
  ): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase() })
      .select("+passwordHash")
      .populate("role");
  }

  public async findUserByEmail(email: string): Promise<UserDocument> {
    const user = await User.findOne({ email: email.toLowerCase() }).populate(
      "role"
    );
    if (!user) {
      throw new NotFoundError("Usuario con ese correo no encontrado.");
    }
    return user;
  }

  public async createUser(userData: CreateUserDto): Promise<UserDocument> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError("El correo electrónico ya está en uso.");
    }

    const userRole = await Role.findOne({ name: userData.role.toLowerCase() });
    if (!userRole) {
      throw new BadRequestError("El rol especificado no existe.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      ...userData,
      passwordHash: hashedPassword,
      role: userRole._id,
    });
    await newUser.save();
    return newUser;
  }

  public async updateUser(
    id: string,
    userData: UpdateUserDto
  ): Promise<UserDocument> {
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    }).populate("role");
    if (!updatedUser) {
      throw new NotFoundError("Usuario no encontrado.");
    }
    return updatedUser;
  }

  public async deleteUser(id: string): Promise<UserDocument> {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundError("Usuario no encontrado.");
    }
    return deletedUser;
  }
}
