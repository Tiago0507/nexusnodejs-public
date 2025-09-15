import { Schema, model, Document, Types } from 'mongoose';
import type { UserDocument } from '../user/user.model';
import type { IEvent } from '../event/event.model';

export interface IPurchase extends Document {
  event: Types.ObjectId | IEvent;
  buyer: Types.ObjectId | UserDocument;
  ticketType: {
    id: Types.ObjectId;
    category: string;
    price: number;
  };
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ticketType: {
    id: { type: Schema.Types.ObjectId, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
  },
  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
  },
}, {
  timestamps: true,
  versionKey: false,
});

const PurchaseModel = model<IPurchase>('Purchase', purchaseSchema);

export default PurchaseModel;