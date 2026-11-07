import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EnquiryStatus, Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { EnquiriesService } from './enquiries.service';

class CreateEnquiryDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(1)
  proficiencyLevel: string;

  @IsString()
  @MinLength(1)
  learningObjectives: string;

  @IsOptional()
  @IsString()
  preferredSchedule?: string;

  @IsString()
  @MinLength(1)
  message: string;
}

class UpdateEnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status: EnquiryStatus;
}

@Controller('enquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnquiriesController {
  constructor(private enquiries: EnquiriesService) {}

  @Post()
  @Roles(Role.STUDENT)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateEnquiryDto,
  ) {
    return this.enquiries.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: { id: string; role: Role }) {
    return this.enquiries.listForUser(user.id, user.role);
  }

  @Patch(':id/status')
  @Roles(Role.TEACHER)
  updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    return this.enquiries.updateStatus(user.id, id, dto.status);
  }
}
