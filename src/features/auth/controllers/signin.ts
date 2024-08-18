import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { loginSchema } from '@auth/schemes/signin';
import { joiValidation } from '@shared/decorators/joi-validation.decorators';
import { authService } from '@auth/services/auth.service';
import { config } from '@root/config';
import { IUserDocument } from '@auth/interfaces/user.interface';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      // Fetch user once
      const existingUser: IUserDocument = await authService.getAuthUserByEmail(email);
      if (!existingUser) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ msg: 'Invalid credentials' });
        return; // Stop execution if the user does not exist
      }

      // Verify password
      const passwordsMatch: boolean = await existingUser.comparePassword(password);
      if (!passwordsMatch) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ msg: 'Invalid credentials' });
        return; // Stop execution if the password is incorrect
      }

      // Create JWT with role
      const userJwt: string = JWT.sign(
        {
          userId: existingUser._id,
          uId: existingUser.uId,
          email: existingUser.email,
          fullName: existingUser.fullName,
          role: existingUser.role, // Include role in the JWT
          createdAt: existingUser.createdAt
        },
        config.JWT_TOKEN!,
        { expiresIn: '1h' } // Optional: set token expiration time
      );

      // Respond with user document and token
      res.status(HTTP_STATUS.OK).json({ msg: 'User login successful', token: userJwt });

    } catch (error) {
      // Handle unexpected errors
      console.error('Error during sign-in:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ msg: 'An error occurred during sign-in' });
    }
  }
}
