import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role, SupportStatus } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SupportService } from './support.service';

class AdminReplyDto {
  @IsString()
  @MinLength(1)
  body: string;
}

class StatusDto {
  @IsEnum(SupportStatus)
  status: SupportStatus;
}

@Controller('admin/support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SupportAdminController {
  constructor(private support: SupportService) {}

  @Get()
  list() {
    return this.support.listAdmin();
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.support.getAdmin(id);
  }

  @Post(':id/messages')
  reply(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminReplyDto,
  ) {
    return this.support.adminReply(id, user.id, dto.body);
  }

  @Patch(':id')
  status(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.support.setStatus(id, dto.status);
  }
}
