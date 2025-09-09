// models/User.ts
import mongoose, { Schema, model, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

interface IRole { _id: Types.ObjectId; name: string; description?: string }
interface IPermission { _id: string; name?: string; description?: string }

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string; 
  role?: IRole;
  permission?: IPermission;
}

export interface UserMethods {
  hasPermission(permId: string): boolean;
  hasRole(roleName: string): boolean;
}

export type UserDocument = HydratedDocument<IUser, UserMethods>;
export interface UserModel extends Model<IUser, {}, UserMethods> {}

const RoleSchema = new Schema<IRole>({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true }
}, { _id: false });

const PermissionSchema = new Schema<IPermission>({
  _id: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  description: { type: String, trim: true }
}, { _id: false });

const UserSchema = new Schema<IUser, UserModel, UserMethods>({
  firstName: { type: String, trim: true, required: true },
  lastName:  { type: String, trim: true, required: true },
  email: {
    type: String, required: true, lowercase: true, unique: true, index: true, trim: true,
    validate: { validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Email inválido" }
  },
  passwordHash: { type: String, required: true, select: false },
  role: RoleSchema,
  permission: PermissionSchema
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, any>) => {
      ret.id = ret._id?.toString?.();
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    }
  }
});

// virtual sin arrow y con this tipado
UserSchema.virtual("fullName").get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`.trim();
});

// methods sin arrow y con this tipado EXACTO
UserSchema.methods.hasPermission = function (this: UserDocument, permId: string) {
  return this.permission?._id === permId;
};
UserSchema.methods.hasRole = function (this: UserDocument, roleName: string) {
  return this.role?.name === roleName;
};

export default model<IUser, UserModel>("User", UserSchema);
