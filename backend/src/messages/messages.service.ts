import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async listConversations(userId: string, role: Role) {
    const where =
      role === Role.TEACHER
        ? { teacher: { userId } }
        : { student: { userId } };
    const rows = await this.prisma.conversation.findMany({
      where,
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      student: {
        firstName: row.student.user.firstName,
        lastName: row.student.user.lastName,
        country: row.student.user.country,
      },
      teacher: {
        firstName: row.teacher.user.firstName,
        lastName: row.teacher.user.lastName,
        slug: row.teacher.slug,
        photoUrl: row.teacher.photoUrl,
      },
      lastMessage: row.messages[0] ?? null,
      updatedAt: row.updatedAt,
    }));
  }

  async getThread(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    const allowed =
      conversation.student.userId === userId ||
      conversation.teacher.userId === userId;
    if (!allowed) throw new ForbiddenException();

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return conversation;
  }

  async send(userId: string, conversationId: string, body: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { student: true, teacher: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    const allowed =
      conversation.student.userId === userId ||
      conversation.teacher.userId === userId;
    if (!allowed) throw new ForbiddenException();

    const message = await this.prisma.message.create({
      data: { conversationId, senderId: userId, body },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return message;
  }
}
