import { IUserDocument } from '@auth/interfaces/user.interface';
import { UserhModel } from '@auth/models/auth.schema';
import { Helpers } from '@shared/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IUserDocument): Promise<void> {
    await UserhModel.create(data);
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await UserhModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    );
  }

  public async getUserByUsernameOrEmail(email: string): Promise<IUserDocument> {
    const query = {
      $or: [ { email: Helpers.lowerCase(email) }]
    };
    const user: IUserDocument = (await UserhModel.findOne(query).exec()) as IUserDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserhModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IUserDocument;
    return user;
  }

  public async getAuthUserById(id: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserhModel.findOne({ id: id }).exec()) as IUserDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserhModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IUserDocument;
    return user;
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IUserDocument> {
    const user: IUserDocument = (await UserhModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IUserDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
