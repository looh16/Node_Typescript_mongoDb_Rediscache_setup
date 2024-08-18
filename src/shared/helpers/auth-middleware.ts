import { Request, Response, NextFunction, RequestHandler } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@auth/services/auth.service';
import { NotAuthorizedError } from '@shared/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/user.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new NotAuthorizedError('Token is not available. Please log in again.');
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'

    try {
      const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload; // Attach user payload to the request object
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please log in again.');
    }

    next(); // Proceed to the next middleware or route handler
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route.');
    }
    next(); // Proceed to the next middleware or route handler
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
