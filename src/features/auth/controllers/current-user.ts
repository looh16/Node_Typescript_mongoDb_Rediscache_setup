import { IUserDocument } from '@auth/interfaces/user.interface';
import { authService } from '@auth/services/auth.service';
import { userCache } from '@auth/services/user.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';


export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user: IUserDocument | null = null;

    if (req.currentUser) {
      const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser.userId}`)) as IUserDocument;
      const existingUser: IUserDocument = cachedUser || await authService.getAuthUserById(`${req.currentUser.userId}`);

      if (existingUser && Object.keys(existingUser).length) {
        isUser = true;
        token = req.headers.authorization?.split(' ')[1] || null; // Extract token from header
        user = existingUser;
      }
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
