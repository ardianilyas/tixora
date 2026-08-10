import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", details?: any) {
    super(message, 400, details);
  }
}