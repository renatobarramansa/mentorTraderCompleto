import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }
  
  @Put('profile')
  updateProfile(
    @Request() req,
    @Body() data: { name?: string; image?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, data);
  }
  
  @Get('stats')
  getStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }
}
