import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../shared/types/express";
import { sendError } from "../shared/utils/response";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.auth?.user;

    if (!user) return sendError(res, "Unauthorized", 401);

    if (!roles.includes(user.role)) return sendError(res, "Forbidden", 403);

    next();
  };
};