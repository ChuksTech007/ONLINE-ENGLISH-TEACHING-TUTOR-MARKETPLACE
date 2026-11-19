import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const WELCOME =
  'Thanks for writing. A Merit administrator will reply in this chat. Typical replies are within one working day. If your question is about a lesson, message your teacher from the dashboard — we do not sit in the classroom.';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async getMine(visitorId: string, userId?: string) {
    const thread = await this.prisma.supportThread.findFirst({
      where: userId
        ? { OR: [{ visitorId }, { userId }] }
        : { visitorId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { lastMessageAt: 'desc' },
    });
    return thread;
  }

  async startOrSend(input: {
    visitorId: string;
    name: string;
    email: string;
    body: string;
    userId?: string;
  }) {
    const body = input.body.trim();
    if (!body) throw new ForbiddenException('Message is required');

    let thread = await this.prisma.supportThread.findUnique({
      where: { visitorId: input.visitorId },
    });

    if (!thread) {
      thread = await this.prisma.supportThread.create({
        data: {
          visitorId: input.visitorId,
          userId: input.userId,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          status: SupportStatus.OPEN,
        },
      });
      await this.prisma.supportMessage.create({
        data: {
          threadId: thread.id,
          body,
          fromStaff: false,
          senderId: input.userId,
        },
      });
      await this.prisma.supportMessage.create({
        data: {
          threadId: thread.id,
          body: WELCOME,
          fromStaff: true,
        },
      });
    } else {
      if (thread.status === SupportStatus.CLOSED) {
        thread = await this.prisma.supportThread.update({
          where: { id: thread.id },
          data: { status: SupportStatus.OPEN, userId: input.userId || thread.userId },
        });
      }
      await this.prisma.supportMessage.create({
        data: {
          threadId: thread.id,
          body,
          fromStaff: false,
          senderId: input.userId,
        },
      });
    }

    await this.prisma.supportThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() },
    });

    return this.prisma.supportThread.findUniqueOrThrow({
      where: { id: thread.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async visitorSend(threadId: string, visitorId: string, body: string, userId?: string) {
    const thread = await this.prisma.supportThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Chat not found');
    if (thread.visitorId !== visitorId && thread.userId !== userId) {
      throw new ForbiddenException('This chat belongs to another visitor');
    }
    const text = body.trim();
    if (!text) throw new ForbiddenException('Message is required');

    await this.prisma.supportMessage.create({
      data: {
        threadId,
        body: text,
        fromStaff: false,
        senderId: userId,
      },
    });
    await this.prisma.supportThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date(), status: SupportStatus.OPEN },
    });
    return this.prisma.supportThread.findUniqueOrThrow({
      where: { id: threadId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  listAdmin() {
    return this.prisma.supportThread.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async getAdmin(id: string) {
    const thread = await this.prisma.supportThread.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!thread) throw new NotFoundException('Chat not found');
    return thread;
  }

  async adminReply(id: string, adminId: string, body: string) {
    await this.getAdmin(id);
    const text = body.trim();
    if (!text) throw new ForbiddenException('Message is required');
    await this.prisma.supportMessage.create({
      data: {
        threadId: id,
        body: text,
        fromStaff: true,
        senderId: adminId,
      },
    });
    await this.prisma.supportThread.update({
      where: { id },
      data: { lastMessageAt: new Date(), status: SupportStatus.OPEN },
    });
    return this.getAdmin(id);
  }

  async setStatus(id: string, status: SupportStatus) {
    await this.getAdmin(id);
    return this.prisma.supportThread.update({
      where: { id },
      data: { status },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  openCount() {
    return this.prisma.supportThread.count({ where: { status: SupportStatus.OPEN } });
  }
}
