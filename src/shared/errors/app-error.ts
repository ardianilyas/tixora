export class AppError extends Error {
  public statusCode: number;
  public success: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}