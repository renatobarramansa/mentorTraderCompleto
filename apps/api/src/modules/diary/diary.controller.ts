import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto, UpdateDiaryDto } from './dto/diary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('diary')
@UseGuards(JwtAuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@Request() req, @Body() createDiaryDto: CreateDiaryDto) {
    return this.diaryService.create(req.user.id, createDiaryDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('pair') pair?: string,
    @Query('direction') direction?: 'LONG' | 'SHORT',
  ) {
    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (pair) filters.pair = pair;
    if (direction) filters.direction = direction;
    
    return this.diaryService.findAll(req.user.id, filters);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.diaryService.getStats(req.user.id);
  }

  @Get('monthly')
  getMonthlySummary(
    @Request() req,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.diaryService.getMonthlySummary(req.user.id, year, month);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.diaryService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDiaryDto: UpdateDiaryDto,
  ) {
    return this.diaryService.update(req.user.id, id, updateDiaryDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.diaryService.remove(req.user.id, id);
  }
}
