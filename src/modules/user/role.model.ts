import { model, Schema, type HydratedDocument, type Model } from "mongoose";

export interface IRole {
  name: string;
  description?: string;
  permissions: string[];
}

export type RoleDocument = HydratedDocument<IRole>;
export type RoleModel = Model<IRole>;

const RoleSchema = new Schema<IRole, RoleModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
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
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: Record<string, any>) => {
        ret.id = ret._id?.toString?.();
        delete ret._id;
        return ret;
      },
    },
  }
);

export default model<IRole, RoleModel>("Role", RoleSchema);
