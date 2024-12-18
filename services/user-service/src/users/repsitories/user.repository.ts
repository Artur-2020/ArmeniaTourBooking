import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities';
import { BaseRepository } from '../../base/repositories/base.repository';

@Injectable()
export default class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {
    super(User, dataSource);
    Object.assign(this, userRepo);
  }
}
