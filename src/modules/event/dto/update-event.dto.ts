import type { IVenue } from '../event.model';

/**
 * Data Transfer Object (DTO) for updating an Event.
 * Declares optional fields that can be provided in a partial update request.
 * All properties are optional, allowing granular PATCH-like behavior.
 */
export class UpdateEventDto {
  /** Optional new title for the event. */
  title?: string;

  /** Optional new description for the event. */
  description?: string;

  /** Optional new date and time for the event. */
  date?: Date;

  /**
   * Optional venue information update.
   * The structure is defined by the IVenue interface in event.model.
   */
  venue?: IVenue;

  /** Optional category update (e.g., "music", "tech"). */
  category?: string;

  /**
   * Optional status update for the event lifecycle.
   * Supported values:
   * - draft
   * - pending-approval
   * - published
   * - rejected
   * - cancelled
   */
  status?: 'draft' | 'pending-approval' | 'published' | 'rejected' | 'cancelled';
}
