// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
//
// export interface ClientResponse<T = any> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   timestamp: string;
//   requestId?: string;
// }
//
// @Injectable()
// export class TransformInterceptor<T>
//   implements NestInterceptor<T, ClientResponse<T>>
// {
//   intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<ClientResponse<T>> {
//     const request = context.switchToHttp().getRequest();
//     const requestId = request.headers['x-request-id'] || request.id;
//
//     return next.handle().pipe(
//       map((data) => {
//         // If the response is already transformed by a service, just add requestId
//         if (data && typeof data === 'object' && 'success' in data) {
//           return {
//             ...data,
//             requestId,
//           };
//         }
//
//         // Transform raw data into standard response
//         return {
//           success: true,
//           data,
//           timestamp: new Date().toISOString(),
//           requestId,
//         };
//       }),
//     );
//   }
// }
