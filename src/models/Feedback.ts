import { Schema, Types, Document, Model, model } from 'mongoose';
import { IUser } from './User';
import { IRide } from "./Ride";


interface IFeedback extends Document {
    value: string,
    author: IUser['id'],
    recipient: IUser['id'],
    ride: IRide['id'],
}

const FeedbackSchema: Schema<IFeedback> = new Schema<IFeedback>(
    {
        value: {type: String},
        author: {type: Types.ObjectId, ref: 'User'},
        recipient: {type: Types.ObjectId, ref: 'User'},
        ride: {type: Types.ObjectId, ref: 'Ride'}        
    } 
)

const FeedbackModel: Model<IFeedback> = model<IFeedback>('Feedback', FeedbackSchema);

export { IFeedback, FeedbackModel };

