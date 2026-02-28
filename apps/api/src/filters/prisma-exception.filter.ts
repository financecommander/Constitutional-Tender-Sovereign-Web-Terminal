import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Only handle Prisma errors — let other exceptions pass through
    if (!this.isPrismaError(exception)) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `Prisma error ${exception.code}: ${exception.message}`,
    );

    const { status, message } = this.mapPrismaError(exception.code);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private isPrismaError(
    exception: unknown,
  ): exception is { code: string; message: string } {
    if (
      typeof exception !== 'object' ||
      exception === null ||
      !('code' in exception)
    ) {
      return false;
    }
    const code = (exception as Record<string, unknown>).code;
    return typeof code === 'string' && code.startsWith('P');
  }

  private mapPrismaError(code: string): { status: number; message: string } {
    switch (code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with that unique constraint already exists',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referenced record does not exist',
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid relation data provided',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected database error occurred',
        };
    }
  }
}
