import { Schema, Document, Model, model } from 'mongoose';
import { INotification, NotificationModel } from './Notification';


interface IComment {
  userId: string,
  comment: string
}

interface IUser extends Document {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone: string,
  created: Date,
  dateOfBirth: Date,
  avatar: string,
  rate: number,
  feedbacks: Array<IComment>,
  roles: Array<string>,
  accessFailedCount: number,
  notifications: Array<INotification>,
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    firstName: { type: String, minlength: 2, maxlength: 11, required: true },
    lastName: { type: String, minlength: 2, maxlength: 11, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    created: { type: Date },
    dateOfBirth: { type: Date },
    avatar: { type: String },
    rate: { type: Number, default: 5 },
    feedbacks: [{ type: String }],
    roles: [{ type: String, ref: "Role" }],
    accessFailedCount: { type: Number },
    notifications: Array<INotification>,
  },
  { timestamps: true }
);

const UserModel: Model<IUser> = model<IUser>('User', UserSchema);

export { IUser, UserModel };
