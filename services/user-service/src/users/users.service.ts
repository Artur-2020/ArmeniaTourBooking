import { Injectable } from '@nestjs/common';
import UserRepository from './repsitories/user.repository';
import User from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
