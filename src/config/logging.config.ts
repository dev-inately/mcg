import { registerAs } from '@nestjs/config';
import { Request, Response } from 'express';

export default registerAs('logging', () => ({
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV === 'development',
  redact: ['password', 'token', 'secret', 'access_token', 'refresh_token'],
  timestamp: true,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  serializers: {
    req: (req: Request) => {
      return {
        method: req.method,
        url: req.url,
        body: req.body as Record<string, unknown>,
        query: req.query,
        params: req.params,
        ip: req.ip,
      };
    },
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
    err: (err: Error) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: err.type || undefined,
      code: err?.code,
      statusCode: err?.statusCode,
      message: err.message,
      stack: err.stack,
    }),
  },
}));
