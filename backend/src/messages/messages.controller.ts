import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsString, MinLength } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

class SendMessageDto {
  @IsString()
  @MinLength(1)
  body: string;
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Get()
  list(@CurrentUser() user: { id: string; role: Role }) {
    return this.messages.listConversations(user.id, user.role);
  }

  @Get(':id')
  thread(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.messages.getThread(user.id, id);
  }

  @Post(':id')
  send(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.send(user.id, id, dto.body);
  }
}
