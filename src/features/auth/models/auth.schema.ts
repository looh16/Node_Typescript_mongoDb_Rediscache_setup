import { IUserDocument } from '@auth/interfaces/user.interface';
import { hash, compare } from 'bcryptjs';
import { model, Model, Schema } from 'mongoose';

const SALT_ROUND = 10;

const userSchema: Schema = new Schema(
  {
    fullName: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    locality: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    year: { type: Number, default: new Date().getFullYear() },
    role:{
      type:String,
      default: "buyer"
  },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.pre('save', async function (this: IUserDocument, next: () => void) {
  const hashedPassword: string = await hash(this.password as string, SALT_ROUND);
  this.password = hashedPassword;
  next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IUserDocument).password!;
  return compare(password, hashedPassword);
};

userSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return hash(password, SALT_ROUND);
};

const UserhModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');
export { UserhModel };
