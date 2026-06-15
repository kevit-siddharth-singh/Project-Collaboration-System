import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserDocument } from './Schemas/user.schema';
import { sanitizeUser } from '../../common/utils/sanitize-user.util';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<Partial<UserDocument>[]> {
    const users = await this.userRepository.find({});
    return users.map(sanitizeUser);
  }

  async findById(id: string): Promise<Partial<UserDocument>> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return sanitizeUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.delete({ _id: id });
    if (!user) throw new NotFoundException('User not found');
  }
}
