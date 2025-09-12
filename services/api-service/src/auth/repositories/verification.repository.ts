import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Verification } from '../entities';
import { BaseRepository } from '../../base/repositories/base.repository';

@Injectable()
export default class VerificationRepository extends BaseRepository<Verification> {
  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
    private readonly dataSource: DataSource,
  ) {
    super(Verification, dataSource);
    Object.assign(this, verificationRepo);
  }
}
