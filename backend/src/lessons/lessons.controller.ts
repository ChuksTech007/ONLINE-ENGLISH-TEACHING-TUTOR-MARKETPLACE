import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LessonStatus, MeetingPlatform, Role } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { LessonsService } from './lessons.service';

class RequestLessonDto {
  @IsString()
  teacherId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  startAt: string;

  @IsInt()
  @Min(15)
  durationMinutes: number;

  @IsOptional()
  @IsEnum(MeetingPlatform)
  platform?: MeetingPlatform;
}

class UpdateLessonDto {
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsOptional()
  @IsEnum(MeetingPlatform)
  platform?: MeetingPlatform;

  @IsOptional()
  @IsString()
  description?: string;
}

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private lessons: LessonsService) {}

  @Get()
  list(@CurrentUser() user: { id: string; role: Role }) {
    return this.lessons.list(user.id, user.role);
  }

  @Post()
  @Roles(Role.STUDENT)
  request(
    @CurrentUser() user: { id: string },
    @Body() dto: RequestLessonDto,
  ) {
    return this.lessons.request(user.id, dto);
  }

  @Patch(':id')
  @Roles(Role.TEACHER)
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessons.update(user.id, id, dto);
  }
}
