import mongoose, { Schema, model, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

/* ---------- Tipos ---------- */
export interface ITicketType {
  _id: Types.ObjectId;
  category: string;
  price: number;
  quantityAvailable: number;
  salesStart?: Date;
  salesEnd?: Date;
}
export interface IVenue {
  _id: Types.ObjectId;
  name: string;
  address?: string;
  city?: string;
  capacity?: number;
}
export interface IEvent {
  title: string;
  description?: string;
  eventDate: Date;
  status: "draft" | "published" | "canceled" | "finished";
  category?: string;
  organizerId: Types.ObjectId;
  venue?: IVenue;
  ticketTypes: ITicketType[];
  createdAt?: Date;
  updatedAt?: Date;
  isSoldOut?: boolean; // virtual
}

export type EventDocument = HydratedDocument<IEvent>;
export interface EventModel extends Model<IEvent> {}

/* ---------- Schemas embebidos ---------- */
const VenueSchema = new Schema<IVenue>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    capacity: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const TicketTypeSchema = new Schema<ITicketType>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    salesStart: Date,
    salesEnd: Date
  },
  { _id: false }
);

/* ---------- Event ---------- */
const EventSchema = new Schema<IEvent, EventModel>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    eventDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["draft", "published", "canceled", "finished"],
      default: "draft",
      index: true
    },
    category: { type: String, trim: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    venue: VenueSchema,
    ticketTypes: { type: [TicketTypeSchema], default: [] }
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

EventSchema.index({ title: "text", description: "text" });

EventSchema.virtual("isSoldOut").get(function (this: EventDocument) {
  return Array.isArray(this.ticketTypes) && this.ticketTypes.length > 0
    ? this.ticketTypes.every((tt: ITicketType) => (tt.quantityAvailable ?? 0) <= 0)
    : false;
});

EventSchema.pre("validate", function (this: EventDocument, next: (err?: Error) => void) {
  for (const tt of this.ticketTypes ?? []) {
    if (tt.salesStart && tt.salesEnd && tt.salesEnd < tt.salesStart) {
      return next(new Error("salesEnd no puede ser menor que salesStart"));
    }
  }
  next();
});

export default model<IEvent, EventModel>("Event", EventSchema);
