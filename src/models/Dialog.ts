import { Schema, Types, Document, Model, model } from 'mongoose';
import { IUser } from './User';
import { v4 as uuidv4 } from 'uuid';
import { IRide } from './Ride';
import { IAsk } from './Ask';

interface IDialogBody {
  id: string,
  author: IUser['id'],
  content: string,
  created_at: Date,
  read: boolean
}

interface IDialog extends Document {
  participants: Array<IUser['id']>,
  referedRide: IRide['id'],
  referedAsk: IAsk['id'],
  body: Array<IDialogBody>
}

const DialogSchema: Schema<IDialog> = new Schema<IDialog> (
  {
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    referedRide: { type: Types.ObjectId, ref: "Ride", required: true },
    referedAsk: { type: Types.ObjectId, ref: "Ask", required: true },
    body: [
      {
        id: { type: String, unique: true, default: uuidv4 },
        author: { type: Types.ObjectId, ref: "User", required: true },
        content: { type: String },
        created_at: { type: Date },
        read: { type: Boolean, default: false },
        _id: false,
      },
    ],
  },
  { timestamps: true }
)

const DialogModel: Model<IDialog> = model<IDialog>('Dialog', DialogSchema);

export { IDialog, DialogModel };