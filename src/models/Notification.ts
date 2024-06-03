import { Schema, Types, Document, Model, model } from 'mongoose';
import { IUser } from './User';

interface INotification extends Document {
  // recipient: IUser['id'],
  initiator: string,
  eventType: string,
  // data: string,
  notified: boolean
}

const NotificationSchema: Schema<INotification> = new Schema<INotification> (
  {
    // recipient: { type: Types.ObjectId, ref: "User", required: true },
    initiator: { type: String },
    eventType: { type: String },    
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const NotificationModel: Model<INotification> = model<INotification>('Notification', NotificationSchema);

export { INotification, NotificationModel };


