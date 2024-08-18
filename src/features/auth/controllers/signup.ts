import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@shared/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { Helpers } from '@shared/helpers/helpers';
import { authService } from '@auth/services/auth.service';
import { authQueue } from '@auth/services/auth.queue';
import { ISignUpData, IUserDocument } from '@auth/interfaces/user.interface';
import { userCache } from '@auth/services/user.cache';



export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { fullName, email, password, role } = req.body;
    const checkIfUserExist: IUserDocument = await authService.getUserByUsernameOrEmail(email);
    if (checkIfUserExist) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ msg: 'user with same email already exist'});
      return; // Stop execution if the user exists
    }

    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    const authData: IUserDocument = SignUp.prototype.signupData({
      _id: userObjectId,
      uId,
      fullName,
      email,
      password,
      role
    });

    // Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);

    res.status(HTTP_STATUS.CREATED).json({ msg: 'User created successfully', user: userDataForCache , token: userJwt });
  }

  private signToken(data: IUserDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        fullName: data.fullName
      },
      config.JWT_TOKEN!,
      { expiresIn: '1h' } // Token expiration time
    );
  }

  private signupData(data: ISignUpData): IUserDocument {
    const { _id, fullName, email, uId, password, role } = data;
    return {
      _id,
      uId,
      fullName: Helpers.firstLetterUppercase(fullName),
      email: Helpers.lowerCase(email),
      password,
      role,
    } as IUserDocument;
  }

  private userData(data: IUserDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, fullName, email, uId, password, role, createdAt, year } = data;
    return {
      _id: userObjectId,
      uId,
      fullName: Helpers.firstLetterUppercase(fullName),
      email,
      password,
      role,
      createdAt,
      year
    } as unknown as IUserDocument;
  }
}
