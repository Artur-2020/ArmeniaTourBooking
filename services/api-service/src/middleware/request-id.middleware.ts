import { Request, Response, NextFunction } from 'express';

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function RequestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate a unique request ID if not present
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = generateRequestId();
  }

  // Add request ID to response headers for client tracking
  res.setHeader('x-request-id', req.headers['x-request-id'] as string);

  next();
}
