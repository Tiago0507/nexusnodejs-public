import { model, Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * Interface representing a Role document in the database.
 * Defines the structure and properties of a user role.
 */
export interface IRole {
  /** The unique name of the role (e.g., 'admin', 'editor'). */
  name: string;
  /** An optional description of the role's purpose. */
  description?: string;
  /** An array of permission strings associated with the role. */
  permissions: string[];
}

/** Represents a hydrated Mongoose document for a Role, including instance methods. */
export type RoleDocument = HydratedDocument<IRole>;
/** Represents the Mongoose Model for the Role collection. */
export type RoleModel = Model<IRole>;

/**
 * Defines the Mongoose schema for the Role model.
 */
const RoleSchema = new Schema<IRole, RoleModel>(
  {
    // Defines the role's name with constraints.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Defines the optional role description.
    description: {
      type: String,
      trim: true,
    },
    // Defines the array of permissions for the role.
    permissions: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true,
    // Disables the `__v` version key added by Mongoose.
    versionKey: false,
    // Defines a transform function for when the document is converted to JSON.
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: Record<string, any>) => {
        // Creates a virtual 'id' property from the '_id' field.
        ret.id = ret._id?.toString?.();
        // Removes the '_id' field from the final JSON output.
        delete ret._id;
        return ret;
      },
    },
  }
);

// Compiles the schema into a model and exports it.
export default model<IRole, RoleModel>("Role", RoleSchema);