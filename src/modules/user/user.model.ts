import mongoose, { Schema, model, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";
import type { RoleDocument } from "./role.model";

/**
 * Interface representing the base properties of a User document.
 */
export interface IUser {
  /** The user's first name. */
  firstName: string;
  /** The user's last name. */
  lastName: string;
  /** The user's unique email address. */
  email: string;
  /** The user's hashed password. */
  passwordHash: string;
  /** A reference to the user's assigned role. */
  role: Types.ObjectId | RoleDocument;
}

/**
 * Interface defining the custom instance methods for a User document.
 */
export interface UserMethods {
  /**
   * Checks if the user has a specific permission through their assigned role.
   * @param {string} permission - The permission string to check for.
   * @returns {Promise<boolean>} A promise that resolves to true if the user has the permission, otherwise false.
   */
  hasPermission(permission: string): Promise<boolean>;
}

/** Represents a hydrated Mongoose document for a User, combining base properties and instance methods. */
export type UserDocument = HydratedDocument<IUser, UserMethods>;
/** Represents the Mongoose Model for the User collection, aware of the custom instance methods. */
export interface UserModel extends Model<IUser, {}, UserMethods> {}

/**
 * Defines the Mongoose schema for the User model.
 */
const UserSchema = new Schema<IUser, UserModel, UserMethods>(
  {
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      trim: true,
      // Custom validator for email format.
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Email inválido",
      },
    },
    // The password hash is not returned by default in queries for security.
    passwordHash: { type: String, required: true, select: false },
    // Establishes a relationship with the Role model.
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` timestamps.
    timestamps: true,
    // Disables the `__v` version key.
    versionKey: false,
    // Defines transformations for when the document is converted to JSON.
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: Record<string, any>) => {
        // Creates a virtual 'id' from '_id'.
        ret.id = ret._id?.toString?.();
        // Removes sensitive or internal fields from the output.
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

/**
 * A virtual property to get the user's full name.
 * This is not stored in the database but is computed on the fly.
 */
UserSchema.virtual("fullName").get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`.trim();
});

/**
 * Implementation of the hasPermission instance method.
 * It checks if a user's role contains a specific permission string.
 * @param {string} permissionToCheck - The permission to validate.
 * @returns {Promise<boolean>} True if the user has the permission, otherwise false.
 */
UserSchema.methods.hasPermission = async function (
  this: UserDocument,
  permissionToCheck: string
): Promise<boolean> {
  // Populates the 'role' field if it hasn't been populated already.
  if (!this.populated("role")) {
    await this.populate<{ role: RoleDocument }>("role");
  }

  const role = this.role as RoleDocument;
  // Checks if the role and its permissions exist and include the required permission.
  if (role && role.permissions) {
    return role.permissions.includes(permissionToCheck.toLowerCase());
  }
  return false;
};

// Compiles the schema into a model and exports it for use in the application.
export default model<IUser, UserModel>("User", UserSchema);