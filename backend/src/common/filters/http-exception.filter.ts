import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (exception instanceof BadRequestException && Array.isArray(exceptionResponse.message)) {
        return response.status(status).json({
          statusCode: status,
          message: 'Validation failed',
          errors: exceptionResponse.message,
        });
      }

      return response.status(status).json({
        statusCode: status,
        message: typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'An error occurred',
      });
    }

    // Unhandled errors — never expose internals
    console.error('Unhandled exception:', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
