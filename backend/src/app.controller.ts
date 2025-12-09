import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Mentor Trader Backend',
      version: '1.0.0',
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'Welcome to Mentor Trader API',
      endpoints: {
        health: '/api/health',
        chat: '/api/chat (POST)',
      },
      documentation: 'Check the README for more information',
    };
  }
}