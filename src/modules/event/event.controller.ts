import type { Request, Response } from 'express';
import { EventService } from './event.service';
import { ApiError } from '../../utils/errors/ApiError';
import type { UserDocument } from '../user/user.model';
import type { RoleDocument } from '../user/role.model';

/** Instantiates the service handling event domain logic and data access. */
const eventService = new EventService();

class EventController {
  /**
   * Creates a new event resource.
   * Extracts the organizer id from the authenticated user and delegates to the service.
   *
   * @param req - Express request containing event payload and authenticated user.
   * @param res - Express response used to return the created event.
   */
  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Reads organizer id from the authenticated user stored in req.user.
      const organizerId = (req.user as UserDocument).id;
      // Delegates persistence to the service layer.
      const event = await eventService.createEvent(req.body, organizerId);
      // Responds with HTTP 201 and the newly created event.
      res.status(201).json(event);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Retrieves events according to query filters and caller role.
   * The role may affect visibility rules inside the service.
   *
   * @param req - Express request with optional query parameters and user context.
   * @param res - Express response used to return the events list.
   */
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Derives role name if the request is authenticated; otherwise leaves it undefined.
      const userRole = req.user ? ((req.user as UserDocument).role as RoleDocument).name : undefined;
      // Delegates retrieval with provided filters and role.
      const events = await eventService.findAllEvents(req.query, userRole);
      // Sends HTTP 200 with the collected events.
      res.status(200).json(events);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Retrieves a single event by id.
   *
   * @param req - Express request containing path parameter id.
   * @param res - Express response used to return the event.
   */
  public async getOne(req: Request, res: Response): Promise<void> {
    try {
      // Fetches the event by identifier.
      const event = await eventService.findEventById(req.params.id!);
      // Sends HTTP 200 with the event payload.
      res.status(200).json(event);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Retrieves events by organizer identifier.
   *
   * @param req - Express request containing organizerId in params.
   * @param res - Express response with the organizer's events.
   */
  public async getByOrganizer(req: Request, res: Response): Promise<void> {
    try {
      // Delegates to service to list events owned by the organizer.
      const events = await eventService.findEventsByOrganizer(req.params.organizerId!);
      // Sends HTTP 200 with matching events.
      res.status(200).json(events);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Updates an existing event, enforcing ownership or admin privileges.
   * Non-admin users are prevented from modifying the status field.
   *
   * @param req - Express request with event id and update data.
   * @param res - Express response used to return the updated event.
   */
  public async update(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      // Loads the target event to verify permissions.
      const event = await eventService.findEventById(eventId!);
      const user = req.user as UserDocument;

      // Evaluates authorization: owner or admin may proceed.
      const userIsOwner = event.organizer._id.toString() === user.id;
      const userIsAdmin = ((user.role as RoleDocument).name) === 'admin';

      if (!userIsOwner && !userIsAdmin) {
        throw new ApiError(403, "FORBIDDEN", "No tienes permiso para actualizar este evento.");
      }

      // Strips status changes when requester is not an admin.
      if (req.body.status && !userIsAdmin) {
        delete req.body.status;
      }

      // Persists the update through the service layer.
      const updatedEvent = await eventService.updateEvent(eventId!, req.body);
      // Returns HTTP 200 with the updated resource.
      res.status(200).json(updatedEvent);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Deletes an event after verifying permission (owner or admin).
   *
   * @param req - Express request with event id param.
   * @param res - Express response; returns 204 No Content on success.
   */
  public async remove(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      // Loads the event to check ownership against the authenticated user.
      const event = await eventService.findEventById(eventId!);
      const user = req.user as UserDocument;

      const userIsOwner = event.organizer._id.toString() === user.id;
      const userIsAdmin = ((user.role as RoleDocument).name) === 'admin';

      if (!userIsOwner && !userIsAdmin) {
        throw new ApiError(403, "FORBIDDEN", "No tienes permiso para eliminar este evento.");
      }

      // Delegates deletion to the service and returns 204 on success.
      await eventService.deleteEvent(eventId!);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handler that maps known ApiError
   * to structured responses and logs unexpected failures.
   *
   * @param error - Thrown error to classify.
   * @param res - Express response used to return an error payload.
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: { code: error.errorCode, message: error.message },
      });
      return;
    }
    // Logs unhandled exceptions for debugging purposes.
    console.error(error);
    // Fallback to generic internal server error.
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

/** Exports a singleton controller instance for routing modules. */
export const eventController = new EventController();
