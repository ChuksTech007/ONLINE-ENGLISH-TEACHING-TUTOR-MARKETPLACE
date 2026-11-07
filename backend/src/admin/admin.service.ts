import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TeacherStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { moneyString } from '../common/utils/money';
import { NotificationsService } from '../notifications/notifications.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private wallets: WalletsService,
  ) {}

  async stats() {
    const [
      teachers,
      approvedTeachers,
      pendingTeachers,
      students,
      enquiries,
      purchases,
      deductions,
      settings,
    ] = await Promise.all([
      this.prisma.teacherProfile.count(),
      this.prisma.teacherProfile.count({ where: { status: 'APPROVED' } }),
      this.prisma.teacherProfile.count({ where: { status: 'PENDING' } }),
      this.prisma.studentProfile.count(),
      this.prisma.enquiry.count(),
      this.prisma.walletTransaction.aggregate({
        where: { type: { in: ['PURCHASE', 'ADMIN_CREDIT'] } },
        _sum: { amount: true },
      }),
      this.prisma.walletTransaction.aggregate({
        where: { type: 'DEDUCTION' },
        _sum: { amount: true },
      }),
      this.prisma.platformSettings.findUnique({ where: { id: 'default' } }),
    ]);

    return {
      totalTeachers: teachers,
      approvedTeachers,
      pendingTeachers,
      totalStudents: students,
      totalEnquiries: enquiries,
      creditSales: moneyString(purchases._sum.amount ?? 0),
      creditDeductions: moneyString(deductions._sum.amount ?? 0),
      contactFee: moneyString(settings?.contactFee ?? 0),
    };
  }

  async teachers() {
    const rows = await this.prisma.teacherProfile.findMany({
      include: { user: true, wallet: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((t) => ({
      id: t.id,
      userId: t.userId,
      slug: t.slug,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
      email: t.user.email,
      country: t.country || t.user.country,
      status: t.status,
      featured: t.featured,
      experienceYears: t.experienceYears,
      hourlyRate: moneyString(t.hourlyRate),
      walletBalance: moneyString(t.wallet?.balance ?? 0),
      createdAt: t.createdAt,
    }));
  }

  async setTeacherStatus(
    adminId: string,
    teacherId: string,
    status: TeacherStatus,
    reason?: string,
  ) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    const updated = await this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? reason ?? 'Rejected' : null,
      },
    });
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: `TEACHER_${status}`,
        entityType: 'TeacherProfile',
        entityId: teacherId,
        reason,
      },
    });
    await this.notifications.create({
      userId: teacher.userId,
      type: 'TEACHER_STATUS',
      title: `Your teacher profile is ${status.toLowerCase()}`,
      body:
        status === 'APPROVED'
          ? 'Your profile can now appear in the teacher directory.'
          : reason || `Status changed to ${status}.`,
      link: '/dashboard/profile',
    });
    return updated;
  }

  async setFeatured(adminId: string, teacherId: string, featured: boolean) {
    const teacher = await this.prisma.teacherProfile.update({
      where: { id: teacherId },
      data: { featured },
    });
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: featured ? 'TEACHER_FEATURED' : 'TEACHER_UNFEATURED',
        entityType: 'TeacherProfile',
        entityId: teacherId,
      },
    });
    return teacher;
  }

  async students() {
    const rows = await this.prisma.studentProfile.findMany({
      include: { user: true, _count: { select: { enquiries: true, lessons: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((s) => ({
      id: s.id,
      userId: s.userId,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      country: s.user.country,
      status: s.user.status,
      enquiries: s._count.enquiries,
      lessons: s._count.lessons,
      createdAt: s.createdAt,
    }));
  }

  async setUserStatus(adminId: string, userId: string, status: UserStatus, reason?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: `USER_${status}`,
        entityType: 'User',
        entityId: userId,
        reason,
      },
    });
    return user;
  }

  async transactions() {
    const rows = await this.prisma.walletTransaction.findMany({
      include: { wallet: { include: { teacher: { include: { user: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
    return rows.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: moneyString(tx.amount),
      previousBalance: moneyString(tx.previousBalance),
      newBalance: moneyString(tx.newBalance),
      reference: tx.reference,
      description: tx.description,
      enquiryId: tx.enquiryId,
      createdAt: tx.createdAt,
      teacher: {
        id: tx.wallet.teacher.id,
        name: `${tx.wallet.teacher.user.firstName} ${tx.wallet.teacher.user.lastName}`,
      },
    }));
  }

  async packages() {
    return this.prisma.creditPackage.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async upsertPackage(adminId: string, data: {
    id?: string;
    name: string;
    creditAmount: number;
    price: number;
    currency?: string;
    active?: boolean;
    sortOrder?: number;
  }) {
    const payload = {
      name: data.name,
      creditAmount: new Prisma.Decimal(data.creditAmount),
      price: new Prisma.Decimal(data.price),
      currency: data.currency ?? 'USD',
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
    };
    const pack = data.id
      ? await this.prisma.creditPackage.update({ where: { id: data.id }, data: payload })
      : await this.prisma.creditPackage.create({ data: payload });
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: data.id ? 'PACKAGE_UPDATED' : 'PACKAGE_CREATED',
        entityType: 'CreditPackage',
        entityId: pack.id,
      },
    });
    return pack;
  }

  async settings() {
    return this.prisma.platformSettings.findUnique({ where: { id: 'default' } });
  }

  async updateSettings(
    adminId: string,
    data: { contactFee?: number; allowNegativeWallet?: boolean; siteName?: string; supportEmail?: string },
  ) {
    const updated = await this.prisma.platformSettings.update({
      where: { id: 'default' },
      data: {
        contactFee: data.contactFee !== undefined ? new Prisma.Decimal(data.contactFee) : undefined,
        allowNegativeWallet: data.allowNegativeWallet,
        siteName: data.siteName,
        supportEmail: data.supportEmail,
      },
    });
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'SETTINGS_UPDATED',
        entityType: 'PlatformSettings',
        entityId: 'default',
        metadata: data as Prisma.InputJsonValue,
      },
    });
    return updated;
  }

  adjustWallet(
    adminId: string,
    teacherId: string,
    body: { amount: number; type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'REFUND'; reason: string; enquiryId?: string },
  ) {
    return this.wallets.adminAdjust({
      teacherId,
      amount: body.amount,
      type: body.type,
      reason: body.reason,
      adminId,
      enquiryId: body.enquiryId,
    });
  }
}
