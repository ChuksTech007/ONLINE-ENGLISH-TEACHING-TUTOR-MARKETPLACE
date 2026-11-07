import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
  @IsString()
  lessonId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  teachingQuality: number;

  @IsInt()
  @Min(1)
  @Max(5)
  communication: number;

  @IsInt()
  @Min(1)
  @Max(5)
  punctuality: number;

  @IsString()
  @MinLength(8)
  comment: string;
}

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Post()
  @Roles(Role.STUDENT)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }
}
