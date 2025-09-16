import mongoose, { Schema, model, type Document, type Model, type Types } from "mongoose";

/**
 * Interface representing the Ticket document structure stored in MongoDB.
 * Extends Mongoose Document for built-in document properties and methods.
 */
export interface TicketDocument extends Document {
  /** Unique alphanumeric code assigned to the ticket. */
  ticketCode: string;

  /** Secure SHA-256 hash used for QR validation. */
  qrCodeHash: string;

  /** Identifier of the ticket type (e.g., category/tier). */
  typeId: Types.ObjectId;

  /** Human-readable category label for the ticket. */
  category: string;

  /** Monetary price of the ticket. */
  price: number;

  /** Flag indicating whether the ticket has been validated or used. */
  isValidated: boolean;

  /** Identifier of the related event. */
  eventId: Types.ObjectId;

  /** Optional identifier of the user who owns the ticket. */
  userId?: Types.ObjectId;

  /** Timestamp of when the ticket was created. */
  createdAt: Date;

  /** Timestamp of when the ticket was last updated. */
  updatedAt: Date;

  /** Identifier of the associated purchase transaction. */
  purchaseId: Types.ObjectId;
}

/**
 * Schema definition for the Ticket collection.
 * Includes validation rules, default values, references, and indexing.
 */
const ticketSchema = new Schema<TicketDocument>(
  {
    // Unique ticket code, trimmed for whitespace safety.
    ticketCode: { type: String, required: true, unique: true, trim: true },

    // QR hash for validating authenticity of the ticket.
    qrCodeHash: { type: String, required: true, index: true },

    // Reference to the ticket type definition.
    typeId: { type: Schema.Types.ObjectId, required: true },

    // Category label stored in uppercase for consistency.
    category: { type: String, required: true, trim: true, uppercase: true },

    // Price value, non-negative.
    price: { type: Number, required: true, min: 0 },

    // Boolean flag indicating whether the ticket is validated.
    isValidated: { type: Boolean, default: false },

    // Reference to the associated event.
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },

    // Reference to the user who owns the ticket (optional).
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },

    // Reference to the purchase in which the ticket was generated.
    purchaseId: { type: Schema.Types.ObjectId, ref: "Purchase", required: true, index: true },
  },
  {
    // Automatically manage createdAt and updatedAt fields.
    timestamps: true,

    // Disables the internal `__v` version key.
    versionKey: false,
  }
);

// Compound index for efficient queries by event and validation status.
ticketSchema.index({ eventId: 1, isValidated: 1 });

// Ensures fast lookups by unique ticket code.
ticketSchema.index({ ticketCode: 1 });

/**
 * TicketModel provides the main entry point for CRUD operations
 * on the Ticket collection using the defined schema.
 */
export const TicketModel: Model<TicketDocument> = model<TicketDocument>("Ticket", ticketSchema);

export default TicketModel;
