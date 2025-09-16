import type { IVenue, ITicketType } from '../event.model';

/**
 * Data Transfer Object (DTO) for creating an Event.
 * It captures the minimum data required by the API/service to persist a new event.
 * This class only declares shape; it does not perform runtime validation.
 * Validation should be enforced at the controller/service layer or via a validator.
 */
export class CreateEventDto {
  /** Human-readable title of the event. */
  title!: string;

  /** Short to medium description explaining the event content or context. */
  description!: string;

  /**
   * Scheduled date and time of the event.
   * It is expected to be a valid Date instance; time zone handling should be defined by the application.
   */
  date!: Date;

  /**
   * Venue information, including location-related details.
   * The structure is defined by the IVenue interface in event.model.
   */
  venue!: IVenue;

  /** Category or classification used for filtering and discovery (e.g., "music", "tech"). */
  category!: string;

  /**
   * Optional list of ticket types available for the event.
   * Each ticket type contains pricing and availability details defined by ITicketType.
   */
  ticketTypes?: ITicketType[];
}
