import mongoose, { Schema, model, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export interface IPurchase {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketIds: Types.ObjectId[];    // refs a Ticket
  totalAmount: number;
  status: "pending" | "paid" | "canceled" | "refunded";
  purchaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PurchaseDocument = HydratedDocument<IPurchase>;
export interface PurchaseModel extends Model<IPurchase> {}

const PurchaseSchema = new Schema<IPurchase, PurchaseModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    ticketIds: [{ type: Schema.Types.ObjectId, ref: "Ticket", index: true }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled", "refunded"],
      default: "paid",
      index: true
    },
    purchaseDate: { type: Date, default: Date.now, index: true }
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
      }
    }
  }
);

// Reglas mínimas
PurchaseSchema.pre("validate", function (this: PurchaseDocument, next: (err?: Error) => void) {
  if (!this.ticketIds || this.ticketIds.length === 0) {
    return next(new Error("La compra debe incluir al menos un ticket"));
  }
  next();
});

export default model<IPurchase, PurchaseModel>("Purchase", PurchaseSchema);
