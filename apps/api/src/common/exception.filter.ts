import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as INestExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppError, type ApiErrorResponse } from '@ico/shared';

@Catch()
export class ExceptionFilter implements INestExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      const body: ApiErrorResponse = {
        ok: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
      };
      res.status(exception.statusCode).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const body: ApiErrorResponse = {
        ok: false,
        error: {
          code: 'http_error',
          message:
            typeof response === 'string'
              ? response
              : ((response as { message?: string }).message ?? exception.message),
        },
      };
      res.status(status).json(body);
      return;
    }

    this.logger.error('Unhandled exception:', exception);
    const body: ApiErrorResponse = {
      ok: false,
      error: { code: 'internal_error', message: 'Internal server error' },
    };
    res.status(500).json(body);
  }
}
