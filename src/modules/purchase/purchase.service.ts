import { Types } from 'mongoose';
import crypto from 'crypto';
import PurchaseModel from './purchase.model';
import EventModel from '../event/event.model';
import TicketModel from '../ticket/ticket.model';
import { NotFoundError, BadRequestError } from '../../utils/errors/ApiError';
import type { UserDocument } from '../user/user.model';

/**
 * Generates a random alphanumeric code for ticket identification.
 * 
 * @returns {string} A random 8-character uppercase hexadecimal string.
 */
function genCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Generates a secure QR code hash using SHA-256 and a UUID.
 * 
 * @returns {string} A unique, cryptographically secure SHA-256 hash string.
 */
function genQrHash(): string {
  return crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex');
}

/**
 * Data transfer object (DTO) for creating a purchase.
 * Encapsulates the minimum required properties for creating a purchase.
 */
interface CreatePurchaseDto {
  /** The identifier of the event being purchased. */
  eventId: string;

  /** The identifier of the ticket type being purchased. */
  ticketTypeId: string;

  /** The number of tickets requested in this purchase. */
  quantity: number;
}

/**
 * Service class responsible for handling purchase-related business logic.
 * It validates event and ticket information, updates availability,
 * creates purchase records, and generates associated tickets.
 */
export class PurchaseService {
  /**
   * Creates a new purchase for a given event and ticket type.
   *
   * @param {CreatePurchaseDto} dto - Object containing eventId, ticketTypeId, and quantity.
   * @param {UserDocument} buyer - The authenticated user making the purchase.
   * @returns {Promise<any>} Resolves with an object containing the purchase record and created tickets.
   * @throws {NotFoundError} If the event or ticket type does not exist.
   * @throws {BadRequestError} If the event is not published or if there is insufficient ticket availability.
   */
  public async createPurchase(dto: CreatePurchaseDto, buyer: UserDocument): Promise<any> {
    const { eventId, ticketTypeId, quantity } = dto;

    // Attempts to retrieve the event by its ID.
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new NotFoundError('El evento especificado no existe.');
    }

    // Ensures that the event is in a "published" state before allowing purchases.
    if (event.status !== 'published') {
      throw new BadRequestError('No se pueden comprar boletos para un evento que no está publicado.');
    }

    // Finds the ticket type within the event's available ticket types.
    const ticketType = event.ticketTypes.find(tt => tt._id?.toString() === ticketTypeId);
    if (!ticketType) {
      throw new NotFoundError('El tipo de boleto especificado no existe para este evento.');
    }

    // Validates that there are enough tickets available for the requested quantity.
    if (ticketType.quantityAvailable < quantity) {
      throw new BadRequestError(`No hay suficientes boletos disponibles. Disponibles: ${ticketType.quantityAvailable}.`);
    }

    // Updates ticket availability and persists the changes in the event document.
    ticketType.quantityAvailable -= quantity;
    await event.save();

    // Calculates the total purchase amount based on ticket price and quantity.
    const totalAmount = ticketType.price * quantity;

    // Creates a new purchase document in the database.
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

    // Prepares ticket documents for bulk insertion, one per purchased ticket.
    const ticketsToCreate = [];
    for (let i = 0; i < quantity; i++) {
      ticketsToCreate.push({
        ticketCode: genCode(),            // Unique alphanumeric ticket code.
        qrCodeHash: genQrHash(),          // Secure hash for QR validation.
        eventId: event._id,
        userId: buyer._id,
        purchaseId: purchase._id,
        typeId: ticketType._id,
        category: ticketType.category,
        price: ticketType.price,
        isValidated: false,               // Flag indicating validation status of the ticket.
      });
    }

    // Inserts all generated ticket documents into the database in a single operation.
    const createdTickets = await TicketModel.insertMany(ticketsToCreate);

    // Returns the purchase record along with the associated tickets.
    return { purchase, tickets: createdTickets };
  }
}

/**
 * Singleton instance of PurchaseService to be reused across the application.
 */
export const purchaseService = new PurchaseService();
