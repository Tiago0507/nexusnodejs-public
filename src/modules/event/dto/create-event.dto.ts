import type { IVenue, ITicketType } from '../event.model.js';

export class CreateEventDto {
  title!: string;
  description!: string;
  date!: Date;
  venue!: IVenue;
  category!: string;
  ticketTypes?: ITicketType[];
}