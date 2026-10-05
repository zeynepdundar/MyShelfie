import type { AuthUser } from "../services/users.js";

/** requireAuth doğrulamayı geçen isteklere kullanıcıyı ekler. */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
