import type { IVenue, ITicketType } from '../event.model';

export class CreateEventDto {
  title!: string;
  description!: string;
  date!: Date;
  venue!: IVenue;
  category!: string;
  ticketTypes?: ITicketType[];
}