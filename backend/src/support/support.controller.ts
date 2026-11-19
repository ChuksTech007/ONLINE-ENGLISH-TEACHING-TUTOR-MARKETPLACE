import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { SupportService } from './support.service';

class StartChatDto {
  @IsString()
  @Length(8, 80)
  visitorId: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  body: string;
}

class VisitorMessageDto {
  @IsString()
  @Length(8, 80)
  visitorId: string;

  @IsString()
  @MinLength(1)
  body: string;
}

@Controller('support')
@UseGuards(OptionalJwtAuthGuard)
export class SupportController {
  constructor(private support: SupportService) {}

  @Get('me')
  me(
    @Query('visitorId') visitorId: string,
    @CurrentUser() user?: AuthUser,
  ) {
    if (!visitorId || visitorId.length < 8) return null;
    return this.support.getMine(visitorId, user?.id);
  }

  @Post()
  start(@Body() dto: StartChatDto, @CurrentUser() user?: AuthUser) {
    return this.support.startOrSend({
      visitorId: dto.visitorId,
      name: dto.name,
      email: user?.email || dto.email,
      body: dto.body,
      userId: user?.id,
    });
  }

  @Post(':id/messages')
  send(
    @Param('id') id: string,
    @Body() dto: VisitorMessageDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.support.visitorSend(id, dto.visitorId, dto.body, user?.id);
  }
}
