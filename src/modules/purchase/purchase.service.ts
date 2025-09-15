import { Types } from 'mongoose';
import crypto from 'crypto';
import PurchaseModel from './purchase.model';
import EventModel from '../event/event.model';
import TicketModel from '../ticket/ticket.model';
import { NotFoundError, BadRequestError } from '../../utils/errors/ApiError';
import type { UserDocument } from '../user/user.model';

function genCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}
function genQrHash(): string {
  return crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex');
}

interface CreatePurchaseDto {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export class PurchaseService {
  public async createPurchase(dto: CreatePurchaseDto, buyer: UserDocument): Promise<any> {
    const { eventId, ticketTypeId, quantity } = dto;

    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('El evento especificado no existe.');
    }

    if (event.status !== 'published') {
      throw new BadRequestError('No se pueden comprar boletos para un evento que no está publicado.');
    }

    const ticketType = event.ticketTypes.find(tt => tt._id?.toString() === ticketTypeId);
    if (!ticketType) {
      throw new NotFoundError('El tipo de boleto especificado no existe para este evento.');
    }

    if (ticketType.quantityAvailable < quantity) {
      throw new BadRequestError(`No hay suficientes boletos disponibles. Disponibles: ${ticketType.quantityAvailable}.`);
    }
    
    ticketType.quantityAvailable -= quantity;
    await event.save();

    const totalAmount = ticketType.price * quantity;
    const purchase = new PurchaseModel({
      event: event._id,
      buyer: buyer._id,
      ticketType: {
        id: ticketType._id,
        category: ticketType.category,
        price: ticketType.price,
      },
      quantity,
      totalAmount,
      status: 'completed',
    });
    await purchase.save();
    
    const ticketsToCreate = [];
    for (let i = 0; i < quantity; i++) {
      ticketsToCreate.push({
        ticketCode: genCode(),
        qrCodeHash: genQrHash(),
        eventId: event._id,
        userId: buyer._id,
        purchaseId: purchase._id,
        typeId: ticketType._id,
        category: ticketType.category,
        price: ticketType.price,
        isValidated: false,
      });
    }

    const createdTickets = await TicketModel.insertMany(ticketsToCreate);

    return { purchase, tickets: createdTickets };
  }
}

export const purchaseService = new PurchaseService();