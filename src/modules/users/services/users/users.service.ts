import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserDocument } from '../../../../database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<Partial<UserDocument>[]> {
    const users = await this.userRepository.find({});
    return users.map((u) => this.sanitize(u));
  }

  async findById(id: string): Promise<Partial<UserDocument>> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.delete({ _id: id });
    if (!user) throw new NotFoundException('User not found');
  }

  private sanitize(user: UserDocument): Partial<UserDocument> {
    const { password, hashedRefreshToken, ...rest } = user.toObject();
    void password;
    void hashedRefreshToken;
    return rest;
  }
}
