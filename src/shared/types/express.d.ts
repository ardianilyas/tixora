import "express";
import type { Role } from "@prisma/client";

export type UserRole = Role;

export interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  image?: string | null | undefined;
}

export interface AuthSession {
  session: {
    id: string;
    expiresAt: Date;
  };

  user: SessionUser;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
    }
  }
}
