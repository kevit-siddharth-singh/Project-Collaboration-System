import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { UserRole } from '../../common/enums/user-role.enums';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    required: true,
  })
  password!: string;

  @Prop({
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Prop()
  hashedRefreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
