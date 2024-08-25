import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity'; // Импортируйте ваши сущности

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('dbHost'),
  port: configService.get<number>('dbPort'),
  username: configService.get<string>('dbUsername'),
  password: configService.get<string>('dbPassword'),
  database: configService.get<string>('dbName'),
  url: configService.get<string>('databaseUrl'),
  entities: [User], // Добавьте все ваши сущности сюда
  synchronize: true, // В продакшене рекомендуется установить в false
});