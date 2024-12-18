import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './email/email.service';
import { WebsocketService } from './websocket/websocket.service';
import { EmailController } from './email/email.controller';
import configuration from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    AuthModule,
  ],
  controllers: [AppController, EmailController],
  providers: [AppService, EmailService, WebsocketService],
})
export class AppModule {}
