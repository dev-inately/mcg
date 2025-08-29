import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseHelper } from './common/helpers';
import type { ApiResponse } from './common/helpers';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): ApiResponse<string> {
    const message = this.appService.getHello();
    return ResponseHelper.success(
      message,
      'Welcome message retrieved successfully',
    );
  }
}
