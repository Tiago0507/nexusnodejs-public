import mongoose, { Schema, model, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";
import type { RoleDocument } from "./role.model";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Types.ObjectId | RoleDocument;
}

export interface UserMethods {
  hasPermission(permission: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, UserMethods>;
export interface UserModel extends Model<IUser, {}, UserMethods> {}

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
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Email inválido",
      },
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: Record<string, any>) => {
        ret.id = ret._id?.toString?.();
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

UserSchema.virtual("fullName").get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.methods.hasPermission = async function (
  this: UserDocument,
  permissionToCheck: string
): Promise<boolean> {
  if (!this.populated("role")) {
    await this.populate<{ role: RoleDocument }>("role");
  }
  const role = this.role as RoleDocument;
  if (role && role.permissions) {
    return role.permissions.includes(permissionToCheck.toLowerCase());
  }
  return false;
};

export default model<IUser, UserModel>("User", UserSchema);
