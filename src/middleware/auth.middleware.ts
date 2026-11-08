import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

export interface AuthenticatedUserPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload | string;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Access token missing or invalid',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Access token missing',
    });
    return;
  }

  const secret: Secret = process.env.JWT_SECRET || 'secret';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
    return;
  }
};
