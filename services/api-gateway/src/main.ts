import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  const port = configService.get<string>('port');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Gateway Documentation')
    .setDescription('API Gateway for Microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);
  console.log(
    `Main application and microservice are running for api gateway service on port ${port}`,
  );
}
bootstrap();
