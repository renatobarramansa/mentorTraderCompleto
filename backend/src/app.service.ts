import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Mentor Trader Backend API v1.0.0';
  }
}