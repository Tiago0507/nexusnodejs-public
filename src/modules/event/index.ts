/**
 * Barrel file for the event module.
 * Re-exports DTOs, model, service, controller, and routes
 * so they can be imported from a single entry point.
 */

// Data Transfer Objects
export * from './dto/create-event.dto';
export * from './dto/update-event.dto';

// Core module exports
export * from './event.model';
export * from './event.service';
export * from './event.controller';

// Express router export
export { default as eventRoutes } from './event.routes';
