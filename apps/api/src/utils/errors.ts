export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}
