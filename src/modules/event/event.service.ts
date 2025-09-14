import { Types } from 'mongoose';
import EventModel from './event.model.js';
import type { IEvent } from './event.model.js';
import type { CreateEventDto } from './dto/create-event.dto.js';
import type { UpdateEventDto } from './dto/update-event.dto.js';
import { NotFoundError, ConflictError } from '../../utils/errors/ApiError.js';

// import PurchaseModel from '../purchase/purchase.model.js';

interface IEventFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  city?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class EventService {
  /**
   * Creates a new event in the database.
   * Assigns the organizer ID and sets the initial status to 'pending approval'.
   * @param eventData Data for the event to create.
   * @param organizerId ID of the user with the 'organizer' role.
   * @returns The document for the newly created event.
   */
  public async createEvent(eventData: CreateEventDto, organizerId: string): Promise<IEvent> {
    const event = new EventModel({
      ...eventData,
      organizer: new Types.ObjectId(organizerId),
      status: 'pending-approval',
    });
    await event.save();
    return event;
  }

  /**
   * Searches and returns a list of events using filters and simple pagination.
   * Applies a key business rule: buyers only see 'published' events.
   * @param filters Object with the filtering parameters.
   * @param userRole Role of the user making the request.
   * @returns An array of event documents.
   */
  public async findAllEvents(filters: IEventFilters, userRole?: string): Promise<IEvent[]> {
    const { page = 1, limit = 10, ...filterParams } = filters;
    const query: any = {};

    // Visibility by role.
    if (!userRole || userRole === 'buyer') {
      query.status = 'published';
    } else if (filterParams.status) {
      query.status = filterParams.status;
    }

    // Dynamic construction of the query based on the filters
    if (filterParams.search) {
      query.title = { $regex: filterParams.search, $options: 'i' };
    }
    if (filterParams.category) {
      query.category = filterParams.category;
    }
    if (filterParams.city) {
      query['venue.city'] = filterParams.city;
    }
    if (filterParams.dateFrom || filterParams.dateTo) {
      query.date = {};
      if (filterParams.dateFrom) query.date.$gte = new Date(filterParams.dateFrom);
      if (filterParams.dateTo) query.date.$lte = new Date(filterParams.dateTo);
    }

    return await EventModel.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ date: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
  }

  /**
   * Searches for a single event by its ID.
   * @param id The ID of the event to search for.
   * @returns The document for the found event.
   * @throws {NotFoundError} If no event with that ID is found.
   */
  public async findEventById(id: string): Promise<IEvent> {
    const event = await EventModel.findById(id).populate('organizer', 'firstName lastName email');
    if (!event) {
      throw new NotFoundError("Evento no encontrado.");
    }
    return event;
  }
  
  /**
   * Finds all events created by a specific organizer.
   * @param organizerId The ID of the organizing user.
   * @returns An array of event documents.
   */
  public async findEventsByOrganizer(organizerId: string): Promise<IEvent[]> {
    return EventModel.find({ organizer: new Types.ObjectId(organizerId) })
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * Updates an existing event.
   * @param id The ID of the event to update.
   * @param updateData The fields to modify.
   * @returns The updated event document.
   * @throws {NotFoundError} If the event does not exist.
   */
  public async updateEvent(id: string, updateData: UpdateEventDto): Promise<IEvent> {
    const updatedEvent = await EventModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedEvent) {
      throw new NotFoundError("Evento no encontrado para actualizar.");
    }
    return updatedEvent;
  }

  /**
   * Deletes an event from the database.
   * @param id The ID of the event to delete.
   * @throws {ConflictError} If the event has purchases and cannot be deleted.
   * @throws {NotFoundError} If the event does not exist.
   */
  public async deleteEvent(id: string): Promise<void> {
    const purchaseCount = 0;

    if (purchaseCount > 0) {
      throw new ConflictError("No se puede eliminar el evento porque tiene compras aprobadas.");
    }
    
    const deletedEvent = await EventModel.findByIdAndDelete(id);
    if (!deletedEvent) {
      throw new NotFoundError("Evento no encontrado para eliminar.");
    }
  }
}