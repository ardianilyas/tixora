import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error";
import { Prisma } from "../../../generated/prisma/client";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  /**
   * Zod Validation Error
   */
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  /**
   * Prisma Known Request Errors
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : err.meta?.target;
        return res.status(409).json({
          success: false,
          message: target
            ? `Unique constraint violation on field(s): ${target}`
            : "A record with this value already exists",
        });
      }
      case "P2025": {
        const model = err.meta?.modelName as string | undefined;

        return res.status(404).json({
          success: false,
          message: model ? `${model} not found` : "Record not found",
        });
      }
      case "P2003": {
        return res.status(400).json({
          success: false,
          message: "Foreign key constraint failed",
        });
      }
      default: {
        return res.status(400).json({
          success: false,
          message: `Database error: ${err.message}`,
        });
      }
    }
  }

  /**
   * Prisma Validation Error
   */
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Database validation error",
    });
  }

  /**
   * Custom App Error
   */
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  /**
   * Unknown Error
   */
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};