import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  const port = configService.get<string>('port');
  await app.listen(port);
  console.log(
    `Main application and microservice are running for api gateway service on port ${port}`,
  );
}
bootstrap();
