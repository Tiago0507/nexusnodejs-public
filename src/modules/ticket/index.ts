/**
 * Barrel file for the ticket module.
 * It centralizes exports so other parts of the application
 * can import routes and models from a single entry point.
 */

 // Exports the Express router handling ticket-related endpoints.
export { default as ticketRoutes } from "./ticket.routes";

// Exports the Mongoose model representing the Ticket collection.
export { default as TicketModel } from "./ticket.model";
