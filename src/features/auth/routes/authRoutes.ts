import { SignIn } from '@auth/controllers/signin';
import { SignUp } from '@auth/controllers/signup';
import { roleMiddleware } from '@shared/helpers/RoleMiddleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup',  SignUp.prototype.create);
    this.router.post('/signin', SignIn.prototype.read);



    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();


/*
app.get('/admin', authMiddleware.verifyUser, roleMiddleware.checkRole('admin'), (req: Request, res: Response) => {
  res.send('Admin content');
});
**/
