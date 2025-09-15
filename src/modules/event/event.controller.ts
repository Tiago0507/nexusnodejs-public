import type { Request, Response } from 'express';
import { EventService } from './event.service';
import { ApiError } from '../../utils/errors/ApiError';
import type { UserDocument } from '../user/user.model';
import type { RoleDocument } from '../user/role.model';

const eventService = new EventService();

class EventController {
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req.user as UserDocument).id;
      const event = await eventService.createEvent(req.body, organizerId);
      res.status(201).json(event);
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user ? ((req.user as UserDocument).role as RoleDocument).name : undefined;
      const events = await eventService.findAllEvents(req.query, userRole);
      res.status(200).json(events);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    try {
      const event = await eventService.findEventById(req.params.id!);
      res.status(200).json(event);
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  public async getByOrganizer(req: Request, res: Response): Promise<void> {
      try {
          const events = await eventService.findEventsByOrganizer(req.params.organizerId!);
          res.status(200).json(events);
      } catch (error) {
          this.handleError(error, res);
      }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const event = await eventService.findEventById(eventId!);
      const user = req.user as UserDocument;

      const userIsOwner = event.organizer._id.toString() === user.id;
      const userIsAdmin = ((user.role as RoleDocument).name) === 'admin';

      if (!userIsOwner && !userIsAdmin) {
        throw new ApiError(403, "FORBIDDEN", "No tienes permiso para actualizar este evento.");
      }
      
      if (req.body.status && !userIsAdmin) {
          delete req.body.status;
      }

      const updatedEvent = await eventService.updateEvent(eventId!, req.body);
      res.status(200).json(updatedEvent);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async remove(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.id;
      const event = await eventService.findEventById(eventId!);
      const user = req.user as UserDocument;
      
      const userIsOwner = event.organizer._id.toString() === user.id;
      const userIsAdmin = ((user.role as RoleDocument).name) === 'admin';

      if (!userIsOwner && !userIsAdmin) {
        throw new ApiError(403, "FORBIDDEN", "No tienes permiso para eliminar este evento.");
      }

      await eventService.deleteEvent(eventId!);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: { code: error.errorCode, message: error.message },
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

export const eventController = new EventController();