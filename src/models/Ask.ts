import { Schema, Types, Document, Model, model } from 'mongoose';
import { ILocality } from './Locality';
import { IRide, IRidePoint } from './Ride';
import { IUser } from './User';

interface IAsk extends Document {
  localityFrom: {
    localityName: string,
    id: ILocality['id']
  },
  destination: {
    localityName: string,
    id: ILocality['id']
  },
  points: Array<IRidePoint>,
  direction: string,
  user: IUser['id'],
  seats: number,
  date: Date,
  offers: Array<IRide>,
  confirmed: boolean,
  agreeded: Array<IRide>,
  completed: boolean,
  comment: string
}

const AskSchema: Schema<IAsk> = new Schema<IAsk> (
  {
    localityFrom: {
      localityName: { type: String, required: true },
      id: { type: Types.ObjectId, ref: "Locality", required: true },
    },
    destination: {
      localityName: { type: String, required: true },
      id: { type: Types.ObjectId, ref: "Locality", required: true },
    },
    points: [
      {
        localityName: { type: String },
        mongoId: { type: Types.ObjectId, ref: "Locality" },
        _id: false,
      },
    ],
    direction: { type: String, required: false },
    user: { type: Types.ObjectId, ref: "User", required: true },
    seats: { type: Number, default: 1 },
    date: { type: Date, required: true },
    offers: [],
    confirmed: { type: Boolean, default: false }, // ride status
    agreeded: [], // ride who confirmed only 1 element
    completed: { type: Boolean, default: false }, // ride status
    //time: [{type: String, ref: 'Role'}],
    comment: { type: String, minlength: 5 },
  },
  { timestamps: true }
)

const AskModel: Model<IAsk> = model<IAsk>('Ask', AskSchema);

export { IAsk, AskModel };

