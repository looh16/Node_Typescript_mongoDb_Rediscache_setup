import  { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  uId: string;
  fullName: string;
  iat?: number;
  role: string;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  email: string;
  fullName: string;
  password: string;
  role:string;
}

export interface IAuthJob {
  value?: string | IUserDocument;
}


export interface IUserDocument extends Document {
  _id: string | ObjectId;
  userId?: string;
  uId: string;
  fullName: string;
  email: string;
  password?: string;
  province?: string;
  city?: string;
  locality?: string;
  role:string;
  createdAt: Date;
  year: Number;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface IResetPasswordParams {
  username: string;
  email: string;
  ipaddress: string;
  date: string;
}

export interface ISearchUser {
  _id: string;
  profilePicture: string;
  username: string;
  email: string;
  avatarColor: string;
}

export interface ISocketData {
  blockedUser: string;
  blockedBy: string;
}

export interface ILogin {
  userId: string;
}

export interface IUserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value?: string | IUserDocument;
}

export interface IEmailJob {
  receiverEmail: string;
  template: string;
  subject: string;
}

export interface IAllUsers {
  users: IUserDocument[];
  totalUsers: number;
}
