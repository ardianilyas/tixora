import type { Request } from "express";
import type { AuthSession } from "./express";

export interface AuthenticatedRequest extends Request {
  auth: AuthSession;
}
