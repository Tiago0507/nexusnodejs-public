import type { IVenue } from '../event.model.js';

export class UpdateEventDto {
  title?: string;
  description?: string;
  date?: Date;
  venue?: IVenue;
  category?: string;
  status?: 'draft' | 'pending-approval' | 'published' | 'rejected' | 'cancelled';
}