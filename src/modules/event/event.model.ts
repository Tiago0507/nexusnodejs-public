import { Schema, model, Document, Types } from 'mongoose';
import type { UserDocument } from '../user/user.model.js';

/**
 * Describes the structure of a venue embedded in an event.
 * It includes basic location and capacity attributes.
 */
export interface IVenue {
  /** Human-readable venue name. */
  name: string;
  /** Street address of the venue. */
  address: string;
  /** City where the venue is located. */
  city: string;
  /** Maximum number of attendees the venue supports. */
  capacity: number;
}

/**
 * Describes a ticket type available for an event.
 * Each type includes pricing and remaining availability.
 */
export interface ITicketType {
  /** Optional MongoDB ObjectId for the subdocument when persisted. */
  _id?: Types.ObjectId;
  /** Category or label for the ticket (e.g., GENERAL, VIP). */
  category: string;
  /** Price per ticket for this type; must be non-negative. */
  price: number;
  /** Remaining quantity available for sale; must be non-negative. */
  quantityAvailable: number;
}

/**
 * Represents the main Event document stored in MongoDB.
 * Combines metadata, scheduling, venue, status, and ticket type configuration.
 */
export interface IEvent extends Document {
  /** Human-readable title of the event. */
  title: string;
  /** Descriptive text explaining the event details. */
  description: string;
  /** Scheduled date and time for the event. */
  date: Date;
  /** Organizer reference; stores user id or populated UserDocument. */
  organizer: Types.ObjectId | UserDocument;
  /** Embedded venue information. */
  venue: IVenue;
  /** Category used for filtering and discovery. */
  category: string;
  /** Lifecycle status controlling visibility and workflow. */
  status: 'draft' | 'pending-approval' | 'published' | 'rejected' | 'cancelled';
  /** Array of ticket type configurations with pricing and availability. */
  ticketTypes: ITicketType[];
  /** Creation timestamp (managed by Mongoose timestamps). */
  createdAt: Date;
  /** Last update timestamp (managed by Mongoose timestamps). */
  updatedAt: Date;
}

/**
 * Subschema for venue; marked with _id: false to avoid generating ObjectIds
 * for the embedded document.
 */
const venueSchema = new Schema<IVenue>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  capacity: { type: Number, required: true },
}, { _id: false });

/**
 * Subschema for ticket types; includes validation constraints
 * on price and quantity.
 */
const ticketTypeSchema = new Schema<ITicketType>({
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantityAvailable: { type: Number, required: true, min: 0 },
});

/**
 * Main schema for Event; wires together core fields, references,
 * embedded subdocuments, enum status, and timestamps configuration.
 */
const eventSchema = new Schema<IEvent>({
  // Title string trimmed for consistency.
  title: { type: String, required: true, trim: true },
  // Full description text.
  description: { type: String, required: true },
  // Event scheduling field.
  date: { type: Date, required: true },
  // Reference to the User collection for the organizer.
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Embedded venue schema.
  venue: { type: venueSchema, required: true },

  // Category string trimmed for consistency.
  category: { type: String, required: true, trim: true },
  // Enumerated lifecycle status with default draft value.
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending-approval', 'published', 'rejected', 'cancelled'],
    default: 'draft',
  },

  // Array of embedded ticket type subdocuments, empty by default.
  ticketTypes: { type: [ticketTypeSchema], default: [] },
}, {
  // Enables createdAt and updatedAt automatic fields.
  timestamps: true,
  // Disables the internal __v version key.
  versionKey: false,
});

/**
 * EventModel exposes CRUD operations over the Event collection.
 */
const EventModel = model<IEvent>('Event', eventSchema);

export default EventModel;
