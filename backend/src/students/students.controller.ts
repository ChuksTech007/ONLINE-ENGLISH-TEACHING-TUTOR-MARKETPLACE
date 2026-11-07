import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StudentsService } from './students.service';

class UpdateStudentDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentsController {
  constructor(private students: StudentsService) {}

  @Get('me/dashboard')
  dashboard(@CurrentUser() user: { id: string }) {
    return this.students.dashboard(user.id);
  }

  @Patch('me')
  update(@CurrentUser() user: { id: string }, @Body() dto: UpdateStudentDto) {
    return this.students.update(user.id, dto);
  }
}
