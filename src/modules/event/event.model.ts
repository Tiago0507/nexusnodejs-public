import { Schema, model, Document, Types } from 'mongoose';
import type { UserDocument } from '../user/user.model.js';

export interface IVenue {
  name: string;
  address: string;
  city: string;
  capacity: number;
}

export interface ITicketType {
  _id?: Types.ObjectId;
  category: string;
  price: number;
  quantityAvailable: number;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  organizer: Types.ObjectId | UserDocument;
  venue: IVenue;
  category: string;
  status: 'draft' | 'pending-approval' | 'published' | 'rejected' | 'cancelled';
  ticketTypes: ITicketType[];
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  capacity: { type: Number, required: true },
}, { _id: false });

const ticketTypeSchema = new Schema<ITicketType>({
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantityAvailable: { type: Number, required: true, min: 0 },
});

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  venue: { type: venueSchema, required: true },
  
  category: { type: String, required: true, trim: true },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending-approval', 'published', 'rejected', 'cancelled'],
    default: 'draft',
  },
  
  ticketTypes: { type: [ticketTypeSchema], default: [] },
}, {
  timestamps: true,
  versionKey: false,
});

const EventModel = model<IEvent>('Event', eventSchema);

export default EventModel;