import { Schema, Document, Types, Model, model } from 'mongoose';
import { IUser } from './User';


export interface IRidePoint {
    localityName: string;
    mongoId: Types.ObjectId;
}

interface IRide extends Document {
    localityFrom: {
        localityName: string;
        id: Types.ObjectId;
    };
    destination: {
        localityName: string;
        id: Types.ObjectId;
    };
    points: Array<IRidePoint>;
    direction: string;
    user: IUser['id'];
    seats_declared: number;
    seats_available: number;
    asks: any[];
    passengers: any[];
    date: Date;
    completed: boolean;
    comment?: string;
}

const RideSchema: Schema<IRide> = new Schema<IRide>(
    {
        localityFrom: {
            localityName: { type: String, required: true },
            id: { type: Types.ObjectId, ref: 'Locality', required: true },
        },
        destination: {
            localityName: { type: String, required: true },
            id: { type: Types.ObjectId, ref: 'Locality', required: true },
        },
        points: [
            {
                localityName: { type: String },
                mongoId: { type: Types.ObjectId, ref: 'Locality' },
                _id: false,
            },
        ],
        direction: { type: String, required: true },
        user: { type: Types.ObjectId, ref: 'User', required: true },      
        seats_declared: { type: Number, default: 1 },
        seats_available: { type: Number, default: 1 },
        asks: [],
        passengers: [],
        date: { type: Date, required: true },
        completed: { type: Boolean, default: false },
        comment: { type: String, minlength: 5 },
    },
    { timestamps: true }
);

const RideModel: Model<IRide> = model<IRide>('Ride', RideSchema);

export { IRide, RideModel };
