import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices'; // Import Inject from @nestjs/common
import { SignUpDTO } from './dtos';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy,
  ) {}

  @Post('signup')
  async signUp(@Body() data: SignUpDTO) {
    try {
      // Отправляем запрос к пользователю сервису
      const result = await this.usersClient
        .send({ cmd: 'sign_up' }, data)
        .toPromise();
      return result;
    } catch (error) {
      // Преобразуем ошибку из микросервиса в HTTP исключение
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
          details: error.details || [],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
