import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TwoFactor } from '../entities';
import { BaseRepository } from '../../base/repositories/base.repository';

@Injectable()
export default class TwoFactorRepository extends BaseRepository<TwoFactor> {
  constructor(
    @InjectRepository(TwoFactor)
    private readonly twoFactorRepository: Repository<TwoFactor>,
    private readonly dataSource: DataSource,
  ) {
    super(TwoFactor, dataSource);
    Object.assign(this, twoFactorRepository);
  }
}
