import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role, TeacherStatus, UserStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

class TeacherStatusDto {
  @IsEnum(TeacherStatus)
  status: TeacherStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

class FeaturedDto {
  @IsBoolean()
  featured: boolean;
}

class UserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

class WalletAdjustDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsIn(['ADMIN_CREDIT', 'ADMIN_DEBIT', 'REFUND'])
  type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'REFUND';

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  enquiryId?: string;
}

class PackageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsNumber()
  creditAmount: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class SettingsDto {
  @IsOptional()
  @IsNumber()
  contactFee?: number;

  @IsOptional()
  @IsBoolean()
  allowNegativeWallet?: boolean;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  supportEmail?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('teachers')
  teachers() {
    return this.admin.teachers();
  }

  @Patch('teachers/:id/status')
  setStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: TeacherStatusDto,
  ) {
    return this.admin.setTeacherStatus(user.id, id, dto.status, dto.reason);
  }

  @Patch('teachers/:id/featured')
  featured(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: FeaturedDto,
  ) {
    return this.admin.setFeatured(user.id, id, dto.featured);
  }

  @Get('students')
  students() {
    return this.admin.students();
  }

  @Patch('users/:id/status')
  userStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UserStatusDto,
  ) {
    return this.admin.setUserStatus(user.id, id, dto.status, dto.reason);
  }

  @Get('transactions')
  transactions() {
    return this.admin.transactions();
  }

  @Post('wallets/:teacherId/adjust')
  adjust(
    @CurrentUser() user: { id: string },
    @Param('teacherId') teacherId: string,
    @Body() dto: WalletAdjustDto,
  ) {
    return this.admin.adjustWallet(user.id, teacherId, dto);
  }

  @Get('packages')
  packages() {
    return this.admin.packages();
  }

  @Post('packages')
  upsertPackage(@CurrentUser() user: { id: string }, @Body() dto: PackageDto) {
    return this.admin.upsertPackage(user.id, dto);
  }

  @Get('settings')
  settings() {
    return this.admin.settings();
  }

  @Patch('settings')
  updateSettings(@CurrentUser() user: { id: string }, @Body() dto: SettingsDto) {
    return this.admin.updateSettings(user.id, dto);
  }
}
