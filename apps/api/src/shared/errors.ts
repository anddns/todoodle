export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Not authenticated') {
    super(401, message);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity') {
    super(422, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(500, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Something went wrong') {
    super(500, message);
  }
}
