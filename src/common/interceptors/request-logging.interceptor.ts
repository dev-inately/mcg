import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(`${method} ${url} - Request started`, {
      method,
      url,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Add duration header to response
          response.setHeader('X-Request-Duration', `${duration}ms`);
          response.setHeader(
            'X-Request-Start-Time',
            new Date(startTime).toISOString(),
          );
          response.setHeader('X-Request-End-Time', new Date().toISOString());

          // Log successful response
          this.logger.log(`${method} ${url} - Request completed successfully`, {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;
          // Add duration header even for errors
          response.setHeader('X-Request-Duration', `${duration}ms`);
          response.setHeader(
            'X-Request-Start-Time',
            new Date(startTime).toISOString(),
          );
          response.setHeader('X-Request-End-Time', new Date().toISOString());

          // Log error response
          this.logger.error(`${method} ${url} - Request failed`, {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );
  }
}
