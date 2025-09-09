import mongoose, { Schema, model, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export interface ITicket {
  code: string;                      // mostrado al usuario / QR
  qrHash: string;                    // hash para validar en puerta
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  typeId: Types.ObjectId;            // Event.ticketTypes._id
  category?: string;
  price: number;
  purchaseId: Types.ObjectId;        // referencia a Purchase
  isValidated: boolean;
  validatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TicketDocument = HydratedDocument<ITicket>;
export interface TicketModel extends Model<ITicket> {}

const TicketSchema = new Schema<ITicket, TicketModel>(
  {
    code:     { type: String, required: true, trim: true, unique: true, index: true },
    qrHash:   { type: String, required: true, unique: true, index: true },
    userId:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId:  { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    typeId:   { type: Schema.Types.ObjectId, required: true },
    category: { type: String, trim: true },
    price:    { type: Number, required: true, min: 0 },
    purchaseId: { type: Schema.Types.ObjectId, ref: "Purchase", required: true, index: true },
    isValidated: { type: Boolean, default: false, index: true },
    validatedAt: Date
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

// Índices compuestos opcionales (búsquedas rápidas en puerta)
TicketSchema.index({ eventId: 1, code: 1 });
TicketSchema.index({ eventId: 1, qrHash: 1 });

export default model<ITicket, TicketModel>("Ticket", TicketSchema);
