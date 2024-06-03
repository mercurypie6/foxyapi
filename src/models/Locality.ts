import { Schema, Document, Model, model } from "mongoose"

interface ILocality extends Document {
    locality: string,
    clarification: string
}

const LocalitySchema: Schema<ILocality> = new Schema<ILocality>(
    {
        locality: {type: String, unique: true},
        clarification: {type: String}
    } 
)

const LocalityModel: Model<ILocality> = model<ILocality>('Locality', LocalitySchema);

export { ILocality, LocalityModel };