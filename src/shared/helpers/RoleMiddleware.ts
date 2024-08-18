import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '@shared/helpers/error-handler';

export class RoleMiddleware {
  public checkRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction): void => {


      const userRole = req.currentUser!.role;
      if (userRole !== requiredRole) {
        throw new NotAuthorizedError('You do not have the required role to access this route.');
      }

      next();
    };
  }
}

export const roleMiddleware = new RoleMiddleware();
