import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TeacherStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { moneyString } from '../common/utils/money';
import { UpdateTeacherProfileDto } from './dto/update-profile.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async publicSearch(query: {
    q?: string;
    country?: string;
    minExperience?: number;
    minPrice?: number;
    maxPrice?: number;
    specialization?: string;
    level?: string;
    native?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(24, Math.max(6, Number(query.pageSize) || 12));
    const where: Prisma.TeacherProfileWhereInput = {
      status: TeacherStatus.APPROVED,
    };

    if (query.country) where.country = { equals: query.country, mode: 'insensitive' };
    if (query.minExperience) where.experienceYears = { gte: Number(query.minExperience) };
    if (query.minPrice || query.maxPrice) {
      where.hourlyRate = {};
      if (query.minPrice) where.hourlyRate.gte = query.minPrice;
      if (query.maxPrice) where.hourlyRate.lte = query.maxPrice;
    }
    if (query.specialization) where.specializations = { has: query.specialization };
    if (query.level) where.levels = { has: query.level };
    if (query.native === 'true') where.isNativeSpeaker = true;
    if (query.native === 'false') where.isNativeSpeaker = false;
    if (query.q) {
      where.OR = [
        { bio: { contains: query.q, mode: 'insensitive' } },
        { qualifications: { contains: query.q, mode: 'insensitive' } },
        { user: { firstName: { contains: query.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.teacherProfile.count({ where }),
      this.prisma.teacherProfile.findMany({
        where,
        include: {
          user: true,
          wallet: true,
          availability: true,
        },
        orderBy: [{ featured: 'desc' }, { averageRating: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      teachers: rows.map((t) => this.serializePublic(t)),
    };
  }

  async getBySlug(slug: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { slug },
      include: {
        user: true,
        wallet: true,
        availability: true,
        certificates: true,
        reviews: {
          where: { hidden: false },
          include: { student: { include: { user: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!teacher || teacher.status !== TeacherStatus.APPROVED) {
      throw new NotFoundException('Teacher not found');
    }
    await this.prisma.teacherProfile.update({
      where: { id: teacher.id },
      data: { profileViews: { increment: 1 } },
    });
    return this.serializePublic(teacher, true);
  }

  async getMine(userId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        wallet: true,
        availability: true,
        certificates: true,
      },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');
    return this.serializePrivate(teacher);
  }

  async updateMine(userId: string, dto: UpdateTeacherProfileDto) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');

    const userData: Prisma.UserUpdateInput = {};
    if (dto.timezone) userData.timezone = dto.timezone;
    if (dto.country) userData.country = dto.country;

    const updated = await this.prisma.teacherProfile.update({
      where: { id: teacher.id },
      data: {
        bio: dto.bio ?? undefined,
        qualifications: dto.qualifications ?? undefined,
        experienceYears: dto.experienceYears ?? undefined,
        specializations: dto.specializations ?? undefined,
        levels: dto.levels ?? undefined,
        languages: dto.languages ?? undefined,
        isNativeSpeaker: dto.isNativeSpeaker ?? undefined,
        hourlyRate: dto.hourlyRate ?? undefined,
        currency: dto.currency ?? undefined,
        methodology: dto.methodology ?? undefined,
        introVideoUrl: dto.introVideoUrl ?? undefined,
        preferredPlatform: dto.preferredPlatform ?? undefined,
        paymentMethods: dto.paymentMethods
          ? (JSON.parse(JSON.stringify(dto.paymentMethods)) as Prisma.InputJsonValue)
          : undefined,
        city: dto.city ?? undefined,
        country: dto.country ?? undefined,
        user: Object.keys(userData).length ? { update: userData } : undefined,
      },
      include: {
        user: true,
        wallet: true,
        availability: true,
        certificates: true,
      },
    });
    return this.serializePrivate(updated);
  }

  async replaceAvailability(
    userId: string,
    slots: { dayOfWeek: number; startMinute: number; endMinute: number }[],
  ) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');
    await this.prisma.$transaction([
      this.prisma.availabilitySlot.deleteMany({ where: { teacherId: teacher.id } }),
      this.prisma.availabilitySlot.createMany({
        data: slots.map((slot) => ({ ...slot, teacherId: teacher.id })),
      }),
    ]);
    return this.prisma.availabilitySlot.findMany({
      where: { teacherId: teacher.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }],
    });
  }

  async setPhoto(userId: string, photoUrl: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');
    return this.prisma.teacherProfile.update({
      where: { id: teacher.id },
      data: { photoUrl },
    });
  }

  async addCertificate(userId: string, title: string, fileUrl: string, fileName: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');
    return this.prisma.certificate.create({
      data: { teacherId: teacher.id, title, fileUrl, fileName },
    });
  }

  async dashboard(userId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });
    if (!teacher) throw new NotFoundException('Teacher profile not found');

    const [enquiryCount, studentCount, upcoming, completed] = await Promise.all([
      this.prisma.enquiry.count({ where: { teacherId: teacher.id } }),
      this.prisma.studentTeacherContact.count({ where: { teacherId: teacher.id } }),
      this.prisma.lesson.count({
        where: {
          teacherId: teacher.id,
          status: { in: ['REQUESTED', 'ACCEPTED', 'SCHEDULED'] },
          startAt: { gte: new Date() },
        },
      }),
      this.prisma.lesson.count({
        where: { teacherId: teacher.id, status: 'COMPLETED' },
      }),
    ]);

    return {
      profileViews: teacher.profileViews,
      newEnquiries: enquiryCount,
      studentsContacted: studentCount,
      walletBalance: moneyString(teacher.wallet?.balance ?? 0),
      totalPurchased: moneyString(teacher.wallet?.totalPurchased ?? 0),
      totalDeducted: moneyString(teacher.wallet?.totalDeducted ?? 0),
      upcomingLessons: upcoming,
      completedLessons: completed,
      averageRating: moneyString(teacher.averageRating),
      reviewCount: teacher.reviewCount,
      status: teacher.status,
    };
  }

  serializePublic(
    teacher: {
      id: string;
      slug: string;
      photoUrl: string | null;
      bio: string;
      qualifications: string;
      experienceYears: number;
      specializations: string[];
      levels: string[];
      languages: string[];
      isNativeSpeaker: boolean;
      hourlyRate: Prisma.Decimal;
      currency: string;
      methodology: string;
      introVideoUrl?: string | null;
      preferredPlatform: string;
      paymentMethods?: Prisma.JsonValue;
      city: string;
      country: string;
      status: string;
      featured: boolean;
      averageRating: Prisma.Decimal;
      reviewCount: number;
      wallet?: { balance: Prisma.Decimal } | null;
      availability?: { dayOfWeek: number; startMinute: number; endMinute: number }[];
      certificates?: { id: string; title: string; fileUrl: string }[];
      reviews?: {
        id: string;
        rating: number;
        teachingQuality: number;
        communication: number;
        punctuality: number;
        comment: string;
        createdAt: Date;
        student: { user: { firstName: string } };
      }[];
      user: { firstName: string; lastName: string; country: string; timezone: string };
    },
    detailed = false,
  ) {
    const acceptingNew =
      teacher.status === 'APPROVED' &&
      Boolean(teacher.wallet) &&
      teacher.wallet!.balance.gt(0);
    const base = {
      id: teacher.id,
      slug: teacher.slug,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      photoUrl: teacher.photoUrl,
      country: teacher.country || teacher.user.country,
      city: teacher.city,
      bio: teacher.bio,
      qualifications: teacher.qualifications,
      experienceYears: teacher.experienceYears,
      specializations: teacher.specializations,
      levels: teacher.levels,
      languages: teacher.languages,
      isNativeSpeaker: teacher.isNativeSpeaker,
      hourlyRate: moneyString(teacher.hourlyRate),
      currency: teacher.currency,
      methodology: teacher.methodology,
      preferredPlatform: teacher.preferredPlatform,
      featured: teacher.featured,
      averageRating: moneyString(teacher.averageRating),
      reviewCount: teacher.reviewCount,
      acceptingNewEnquiries: acceptingNew,
      availability: teacher.availability ?? [],
      timezone: teacher.user.timezone,
    };
    if (!detailed) return base;
    return {
      ...base,
      introVideoUrl: teacher.introVideoUrl,
      paymentMethods: teacher.paymentMethods,
      certificates: teacher.certificates ?? [],
      reviews: (teacher.reviews ?? []).map((review) => ({
        id: review.id,
        rating: review.rating,
        teachingQuality: review.teachingQuality,
        communication: review.communication,
        punctuality: review.punctuality,
        comment: review.comment,
        createdAt: review.createdAt,
        studentName: review.student.user.firstName,
      })),
    };
  }

  serializePrivate(teacher: Parameters<TeachersService['serializePublic']>[0] & { rejectionReason?: string | null; profileViews: number }) {
    return {
      ...this.serializePublic(teacher, true),
      status: teacher.status,
      rejectionReason: teacher.rejectionReason,
      profileViews: teacher.profileViews,
      walletBalance: moneyString(teacher.wallet?.balance ?? 0),
    };
  }

  async assertTeacherOwner(userId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
    });
    if (!teacher) throw new ForbiddenException('Teacher profile required');
    return teacher;
  }
}
