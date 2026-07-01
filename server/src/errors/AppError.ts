/**
 * Typed HTTP error.
 * Throw this anywhere in the request pipeline — errorHandler will
 * forward statusCode and message directly to the client.
 * All other (untyped) errors become generic 500s.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
