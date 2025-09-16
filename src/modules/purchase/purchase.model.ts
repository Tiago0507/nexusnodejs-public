import { Schema, model, Document, Types } from 'mongoose';
import type { UserDocument } from '../user/user.model';
import type { IEvent } from '../event/event.model';

/**
 * Interface representing the shape of a Purchase document in MongoDB.
 * Extends Mongoose Document to inherit standard document properties and methods.
 */
export interface IPurchase extends Document {
  /** Reference to the event being purchased. */
  event: Types.ObjectId | IEvent;

  /** Reference to the user who makes the purchase. */
  buyer: Types.ObjectId | UserDocument;

  /** Details of the purchased ticket type, including ID, category, and price. */
  ticketType: {
    id: Types.ObjectId;
    category: string;
    price: number;
  };

  /** Number of tickets purchased in this transaction. */
  quantity: number;

  /** Total monetary amount of the purchase. */
  totalAmount: number;

  /** Status of the purchase: pending, completed, or cancelled. */
  status: 'pending' | 'completed' | 'cancelled';

  /** Timestamp of when the purchase is created. */
  createdAt: Date;

  /** Timestamp of the last update to the purchase. */
  updatedAt: Date;
}

/**
 * Schema definition for the Purchase collection.
 * Defines structure, validation rules, references, and default behaviors.
 */
const purchaseSchema = new Schema<IPurchase>({
  // Reference to the associated event, required and indexed for query optimization.
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },

  // Reference to the buyer (User), required and indexed for query optimization.
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Embedded sub-document describing the purchased ticket type.
  ticketType: {
    id: { type: Schema.Types.ObjectId, required: true }, // Unique identifier of the ticket type.
    category: { type: String, required: true },          // Category or label of the ticket type.
    price: { type: Number, required: true },             // Price of a single ticket.
  },

  // Number of tickets purchased, must be at least 1.
  quantity: { type: Number, required: true, min: 1 },

  // Total amount charged for the purchase, validated as required.
  totalAmount: { type: Number, required: true },

  // Purchase status with enumerated values and a default of "completed".
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
  },
}, {
  // Automatically adds createdAt and updatedAt timestamps.
  timestamps: true,

  // Disables the internal __v version key field.
  versionKey: false,
});

/**
 * PurchaseModel is the Mongoose model for performing CRUD operations
 * on the Purchase collection using the purchaseSchema definition.
 */
const PurchaseModel = model<IPurchase>('Purchase', purchaseSchema);

export default PurchaseModel;
