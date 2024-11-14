import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserSettings } from '../entities';
import { BaseRepository } from '../../base/repositories/base.repository';

@Injectable()
export default class UserSettingsRepository extends BaseRepository<UserSettings> {
  constructor(
    @InjectRepository(UserSettings)
    private readonly userSettingsRepo: Repository<UserSettings>,
    private readonly dataSource: DataSource,
  ) {
    super(UserSettings, dataSource);
    Object.assign(this, userSettingsRepo);
  }
}
