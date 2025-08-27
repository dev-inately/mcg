import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('logging.level'),
          prettyPrint: configService.get('logging.prettyPrint') ? {
            colorize: true,
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
          } : false,
          redact: configService.get('logging.redact'),
          timestamp: configService.get('logging.timestamp'),
          formatters: configService.get('logging.formatters'),
          serializers: configService.get('logging.serializers'),
        },
      }),
    }),
  ],
})
export class AppLoggingModule {}
