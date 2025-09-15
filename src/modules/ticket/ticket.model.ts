import mongoose, { Schema, model, type Document, type Model, type Types } from "mongoose";

export interface TicketDocument extends Document {
  ticketCode: string;           // del diagrama
  qrCodeHash: string;           // del diagrama
  typeId: Types.ObjectId;       // del diagrama
  category: string;             // del diagrama
  price: number;                // del diagrama
  isValidated: boolean;         // del diagrama

  // referencias útiles para consultas
  eventId: Types.ObjectId;
  userId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<TicketDocument>(
  {
    ticketCode: { type: String, required: true, index: true, unique: true, trim: true },
    qrCodeHash: { type: String, required: true, index: true },
    typeId: { type: Schema.Types.ObjectId, required: true },
    category: { type: String, required: true, trim: true, uppercase: true },
    price: { type: Number, required: true, min: 0 },
    isValidated: { type: Boolean, default: false },

    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

// índices útiles
ticketSchema.index({ eventId: 1, isValidated: 1 });
ticketSchema.index({ ticketCode: 1 });

export const TicketModel: Model<TicketDocument> = model<TicketDocument>("Ticket", ticketSchema);
export default TicketModel;
