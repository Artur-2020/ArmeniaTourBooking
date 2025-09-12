import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Function for catch and handle errors
 * @param error
 */
export default function (error: any): never {
  throw new HttpException(
    {
      error: true,
      status: HttpStatus.BAD_REQUEST,
      message: error.message,
      details: error.details || [],
    },
    HttpStatus.BAD_REQUEST,
  );
}
