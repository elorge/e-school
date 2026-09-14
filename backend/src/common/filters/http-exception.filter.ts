// backend/src/common/filters/http-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/** Normalizes every thrown error (HttpException or otherwise) into one JSON shape. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttpException ? exception.getResponse() : null;

    const message = isHttpException
      ? typeof body === 'string'
        ? body
        : ((body as Record<string, unknown>)?.message ?? exception.message)
      : 'Internal server error';

    // Exceptions thrown with an object body — e.g.
    // `throw new UnauthorizedException({ message: '...', code: 'PIN_INVALID_CREDENTIALS', params: {...} })`
    // — carry a machine-readable code the frontend uses to show a
    // localized message (see web/lib/i18n/error-messages.ts). Plain
    // string exceptions have no code and the frontend falls back to a
    // generic localized message instead of this raw English string.
    const code = isHttpException && body && typeof body === 'object' ? (body as Record<string, unknown>).code : undefined;
    const params = isHttpException && body && typeof body === 'object' ? (body as Record<string, unknown>).params : undefined;

    if (!isHttpException) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      ...(code ? { code, params } : {}),
    });
  }
}
