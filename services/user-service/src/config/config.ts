import * as process from 'node:process';

export default () => ({
  rabbitmqUrl: process.env.RABBITMQ_URL,
  port: parseInt(process.env.LOCAL_PORT, 10),
  databaseUrl: process.env.DATABASE_URL,
  dbHost: process.env.DB_HOST,
  dbPort: parseInt(process.env.DB_PORT, 10),
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  salt: parseInt(process.env.salt, 10),
});
