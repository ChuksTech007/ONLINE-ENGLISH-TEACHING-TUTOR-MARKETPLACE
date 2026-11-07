import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { WalletsService } from './wallets.service';

class PurchaseDto {
  @IsString()
  packageId: string;
}

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class WalletsController {
  constructor(private wallets: WalletsService) {}

  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.wallets.getForTeacherUser(user.id);
  }

  @Get('me/transactions')
  transactions(@CurrentUser() user: { id: string }) {
    return this.wallets.transactionsForTeacherUser(user.id);
  }

  @Get('packages')
  @Roles(Role.TEACHER, Role.ADMIN)
  packages() {
    return this.wallets.listPackages();
  }

  @Post('purchase')
  purchase(@CurrentUser() user: { id: string }, @Body() dto: PurchaseDto) {
    return this.wallets.purchasePackage(user.id, dto.packageId);
  }
}
