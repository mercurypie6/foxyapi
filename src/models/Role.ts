import { Schema, Document, Model, model } from 'mongoose';

interface IRole extends Document {
    value: string
}

const RoleSchema: Schema<IRole> = new Schema<IRole> ({
    value: {type: String, unique: true, default: "User"},
})

const RoleModel: Model<IRole> = model<IRole>('Role', RoleSchema);

export { IRole, RoleModel };
