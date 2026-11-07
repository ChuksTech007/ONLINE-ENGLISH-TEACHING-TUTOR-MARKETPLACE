import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnquiryStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicReference } from '../common/utils/ids';
import { moneyString } from '../common/utils/money';
import { NotificationsService } from '../notifications/notifications.service';
import { InsufficientCreditError } from '../wallets/wallets.service';

@Injectable()
export class EnquiriesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(studentUserId: string, dto: {
    teacherId?: string;
    slug?: string;
    proficiencyLevel: string;
    learningObjectives: string;
    preferredSchedule?: string;
    message: string;
  }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: { user: true },
    });
    if (!student) throw new ForbiddenException('Student account required');

    const teacher = await this.prisma.teacherProfile.findFirst({
      where: dto.teacherId ? { id: dto.teacherId } : { slug: dto.slug },
      include: { user: true, wallet: true },
    });
    if (!teacher || teacher.status !== 'APPROVED') {
      throw new NotFoundException('Teacher not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (teacher.wallet) {
        await tx.$queryRaw`SELECT id FROM "Wallet" WHERE "id" = ${teacher.wallet.id} FOR UPDATE`;
      }

      const existing = await tx.studentTeacherContact.findUnique({
        where: {
          studentId_teacherId: {
            studentId: student.id,
            teacherId: teacher.id,
          },
        },
      });

      const settings = await tx.platformSettings.findUnique({
        where: { id: 'default' },
      });
      const fee = settings?.contactFee ?? new Prisma.Decimal(2);

      let charged = false;
      let chargeAmount = new Prisma.Decimal(0);

      if (!existing) {
        const wallet = await tx.wallet.findUnique({
          where: { teacherId: teacher.id },
        });
        if (!wallet) throw new NotFoundException('Teacher wallet not found');
        if (wallet.balance.lt(fee) && !settings?.allowNegativeWallet) {
          throw new InsufficientCreditError();
        }
        const previous = wallet.balance;
        const next = previous.minus(fee);
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: next,
            totalDeducted: wallet.totalDeducted.plus(fee),
          },
        });
        charged = true;
        chargeAmount = fee;

        const enquiry = await tx.enquiry.create({
          data: {
            studentId: student.id,
            teacherId: teacher.id,
            proficiencyLevel: dto.proficiencyLevel,
            learningObjectives: dto.learningObjectives,
            preferredSchedule: dto.preferredSchedule ?? '',
            message: dto.message,
            charged: true,
            chargeAmount: fee,
          },
        });

        await tx.studentTeacherContact.create({
          data: {
            studentId: student.id,
            teacherId: teacher.id,
            firstEnquiryId: enquiry.id,
            chargedAmount: fee,
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEDUCTION',
            amount: fee,
            previousBalance: previous,
            newBalance: next,
            reference: publicReference('ded'),
            description: `New student enquiry from ${student.user.firstName} ${student.user.lastName}`,
            enquiryId: enquiry.id,
          },
        });

        const conversation = await tx.conversation.upsert({
          where: {
            studentId_teacherId: {
              studentId: student.id,
              teacherId: teacher.id,
            },
          },
          update: {},
          create: { studentId: student.id, teacherId: teacher.id },
        });

        await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId: studentUserId,
            body: dto.message,
          },
        });

        return { enquiry, charged, chargeAmount, previous, next };
      }

      const enquiry = await tx.enquiry.create({
        data: {
          studentId: student.id,
          teacherId: teacher.id,
          proficiencyLevel: dto.proficiencyLevel,
          learningObjectives: dto.learningObjectives,
          preferredSchedule: dto.preferredSchedule ?? '',
          message: dto.message,
          charged: false,
          chargeAmount: 0,
        },
      });

      const conversation = await tx.conversation.upsert({
        where: {
          studentId_teacherId: {
            studentId: student.id,
            teacherId: teacher.id,
          },
        },
        update: {},
        create: { studentId: student.id, teacherId: teacher.id },
      });
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: studentUserId,
          body: dto.message,
        },
      });

      return { enquiry, charged, chargeAmount };
    });

    await this.notifications.create({
      userId: teacher.userId,
      type: 'NEW_ENQUIRY',
      title: 'New student enquiry',
      body: `${student.user.firstName} ${student.user.lastName} contacted you.`,
      link: '/dashboard/enquiries',
    });
    await this.notifications.create({
      userId: studentUserId,
      type: 'ENQUIRY_SENT',
      title: 'Enquiry sent',
      body: `Your message was sent to ${teacher.user.firstName}.`,
      link: '/dashboard/enquiries',
    });

    if (result.charged && result.next && result.next.lt(4)) {
      await this.notifications.create({
        userId: teacher.userId,
        type: 'LOW_CREDIT',
        title: 'Advertising credit is running low',
        body: 'Top up your wallet to keep receiving new student enquiries.',
        link: '/dashboard/wallet',
      });
    }

    return {
      id: result.enquiry.id,
      charged: result.charged,
      chargeAmount: moneyString(result.chargeAmount),
    };
  }

  async listForUser(userId: string, role: Role) {
    if (role === Role.TEACHER) {
      const teacher = await this.prisma.teacherProfile.findUnique({
        where: { userId },
      });
      if (!teacher) throw new ForbiddenException();
      const rows = await this.prisma.enquiry.findMany({
        where: { teacherId: teacher.id },
        include: { student: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map((row) => ({
        id: row.id,
        status: row.status,
        proficiencyLevel: row.proficiencyLevel,
        learningObjectives: row.learningObjectives,
        preferredSchedule: row.preferredSchedule,
        message: row.message,
        charged: row.charged,
        chargeAmount: moneyString(row.chargeAmount),
        createdAt: row.createdAt,
        student: {
          id: row.student.id,
          firstName: row.student.user.firstName,
          lastName: row.student.user.lastName,
          country: row.student.user.country,
        },
      }));
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) throw new ForbiddenException();
    const rows = await this.prisma.enquiry.findMany({
      where: { studentId: student.id },
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      proficiencyLevel: row.proficiencyLevel,
      learningObjectives: row.learningObjectives,
      preferredSchedule: row.preferredSchedule,
      message: row.message,
      createdAt: row.createdAt,
      teacher: {
        id: row.teacher.id,
        slug: row.teacher.slug,
        firstName: row.teacher.user.firstName,
        lastName: row.teacher.user.lastName,
        photoUrl: row.teacher.photoUrl,
      },
    }));
  }

  async updateStatus(teacherUserId: string, enquiryId: string, status: EnquiryStatus) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) throw new ForbiddenException();
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id: enquiryId },
    });
    if (!enquiry || enquiry.teacherId !== teacher.id) {
      throw new NotFoundException('Enquiry not found');
    }
    return this.prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status },
    });
  }
}


