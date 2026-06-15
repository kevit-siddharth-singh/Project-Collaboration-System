import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { User, UserDocument } from '../Schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).select('+password').exec();
  }

  async findByIdWithRefreshToken(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).select('+hashedRefreshToken').exec();
  }
}
