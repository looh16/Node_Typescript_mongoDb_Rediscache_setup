import { CurrentUser } from '@auth/controllers/current-user';
import { authMiddleware } from '@shared/helpers/auth-middleware';
import { roleMiddleware, RoleMiddleware } from '@shared/helpers/RoleMiddleware';
import express, { Router } from 'express';

class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentuser', authMiddleware.checkAuthentication,roleMiddleware.checkRole('seller'), CurrentUser.prototype.read);

    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
