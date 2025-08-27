import { registerAs } from '@nestjs/config';

export default registerAs('logging', () => ({
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV === 'development',
  redact: ['password', 'token', 'secret'],
  timestamp: true,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders(),
    }),
    err: (err: any) => ({
      type: err.type,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
    }),
  },
}));
