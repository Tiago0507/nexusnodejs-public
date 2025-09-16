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

/**
 * Service class that encapsulates the business logic for user management.
 * It handles all interactions with the User and Role database models.
 */
export class UserService {
  /**
   * Retrieves all users from the database, populating their role information.
   * @returns {Promise<UserDocument[]>} A promise that resolves to an array of user documents.
   */
  public async findAllUsers(): Promise<UserDocument[]> {
    return User.find().populate("role");
  }

  /**
   * Finds a single user by their unique identifier, populating their role.
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<UserDocument>} A promise that resolves to the found user document.
   * @throws {NotFoundError} If no user with the given ID is found.
   */
  public async findUserById(id: string): Promise<UserDocument> {
    const user = await User.findById(id).populate("role");
    if (!user) {
      throw new NotFoundError("Usuario no encontrado.");
    }
    return user;
  }

  /**
   * Finds a user by email and explicitly includes their password hash.
   * This method is intended for authentication purposes only.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<UserDocument | null>} A promise that resolves to the user document or null if not found.
   */
  public async findUserByEmailWithPassword(
    email: string
  ): Promise<UserDocument | null> {
    // .select('+passwordHash') overrides the default schema option to exclude the password.
    return User.findOne({ email: email.toLowerCase() })
      .select("+passwordHash")
      .populate("role");
  }

  /**
   * Finds a single user by their email address, populating their role.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<UserDocument>} A promise that resolves to the found user document.
   * @throws {NotFoundError} If no user with the given email is found.
   */
  public async findUserByEmail(email: string): Promise<UserDocument> {
    const user = await User.findOne({ email: email.toLowerCase() }).populate(
      "role"
    );
    if (!user) {
      throw new NotFoundError("Usuario con ese correo no encontrado.");
    }
    return user;
  }

  /**
   * Creates a new user, hashes their password, and assigns them a role.
   * @param {CreateUserDto} userData - The data for the new user.
   * @returns {Promise<UserDocument>} A promise that resolves to the newly created user document.
   * @throws {ConflictError} If the email is already in use.
   * @throws {BadRequestError} If the specified role does not exist.
   */
  public async createUser(userData: CreateUserDto): Promise<UserDocument> {
    // Ensures email uniqueness.
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError("El correo electrónico ya está en uso.");
    }

    // Validates that the provided role name exists in the database.
    const userRole = await Role.findOne({ name: userData.role.toLowerCase() });
    if (!userRole) {
      throw new BadRequestError("El rol especificado no existe.");
    }

    // Hashes the password before storing it.
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      ...userData,
      passwordHash: hashedPassword,
      role: userRole._id, // Assigns the ObjectId of the found role.
    });
    await newUser.save();
    return newUser;
  }

  /**
   * Finds a user by their ID and updates them with new data.
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} userData - An object containing the fields to update.
   * @returns {Promise<UserDocument>} A promise that resolves to the updated user document.
   * @throws {NotFoundError} If no user with the given ID is found.
   */
  public async updateUser(
    id: string,
    userData: UpdateUserDto
  ): Promise<UserDocument> {
    // { new: true } ensures that the updated document is returned.
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    }).populate("role");
    if (!updatedUser) {
      throw new NotFoundError("Usuario no encontrado.");
    }
    return updatedUser;
  }

  /**
   * Deletes a user by their ID.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<UserDocument>} A promise that resolves to the deleted user document.
   * @throws {NotFoundError} If no user with the given ID is found.
   */
  public async deleteUser(id: string): Promise<UserDocument> {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundError("Usuario no encontrado.");
    }
    return deletedUser;
  }
}