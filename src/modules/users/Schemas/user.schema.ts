import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose, Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

import { UserRole } from '../../../common/enums/user-role.enums';

export type UserDocument = HydratedDocument<User>;

@Exclude()
@Schema({ timestamps: true })
export class User {
  @Expose()
  @Transform(({ value }: { value: Types.ObjectId }) => value?.toString())
  _id?: Types.ObjectId;

  @Expose()
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name!: string;

  @Expose()
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password!: string;

  @Expose()
  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Prop({
    type: String,
    select: false,
  })
  hashedRefreshToken?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
