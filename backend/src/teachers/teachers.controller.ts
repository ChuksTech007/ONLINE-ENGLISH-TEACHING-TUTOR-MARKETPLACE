import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ReplaceAvailabilityDto,
  UpdateTeacherProfileDto,
} from './dto/update-profile.dto';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private teachers: TeachersService) {}

  @Get()
  search(
    @Query('q') q?: string,
    @Query('country') country?: string,
    @Query('minExperience') minExperience?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('specialization') specialization?: string,
    @Query('level') level?: string,
    @Query('native') native?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.teachers.publicSearch({
      q,
      country,
      minExperience: minExperience ? Number(minExperience) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      specialization,
      level,
      native,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  me(@CurrentUser() user: { id: string }) {
    return this.teachers.getMine(user.id);
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  dashboard(@CurrentUser() user: { id: string }) {
    return this.teachers.dashboard(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  update(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateTeacherProfileDto,
  ) {
    return this.teachers.updateMine(user.id, dto);
  }

  @Put('me/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  availability(
    @CurrentUser() user: { id: string },
    @Body() dto: ReplaceAvailabilityDto,
  ) {
    return this.teachers.replaceAvailability(user.id, dto.slots);
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.teachers.getBySlug(slug);
  }
}
