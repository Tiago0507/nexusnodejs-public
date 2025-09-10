declare global {
  namespace Express {
    type Role = "user" | "organizer" | "checker" | "admin";
    interface UserPayload {
      id: string;
      role?: Role;
    }
    interface Request {
      user: UserPayload;
    }
  }
}
export {};
