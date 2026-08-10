import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AUTH_MESSAGE, AUTH_STATUS_CODE } from "../constants/auth.constants";
import type { UserRole } from "../types/express";

export async function authMiddleware(
  req: Request, res: Response, next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  
    if (!session) {
      return res.status(AUTH_STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: AUTH_MESSAGE.UNAUTHORIZED,
      });
    }
  
    req.auth = {
      session: session.session,
      user: {
        ...session.user,
        role: (session.user.role as UserRole) ?? "user"
      }
    };

    next();
  } catch (error) {
    next(error);
  }
}