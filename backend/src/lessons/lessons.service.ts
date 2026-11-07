import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessonStatus, MeetingPlatform, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async request(studentUserId: string, dto: {
    teacherId: string;
    title?: string;
    description?: string;
    startAt: string;
    durationMinutes: number;
    platform?: MeetingPlatform;
  }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: { user: true },
    });
    if (!student) throw new ForbiddenException('Student account required');
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: dto.teacherId },
      include: { user: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const startAt = new Date(dto.startAt);
    const endAt = new Date(startAt.getTime() + dto.durationMinutes * 60 * 1000);
    const lesson = await this.prisma.lesson.create({
      data: {
        studentId: student.id,
        teacherId: teacher.id,
        title: dto.title || 'English lesson',
        description: dto.description || '',
        startAt,
        endAt,
        status: LessonStatus.REQUESTED,
        platform: dto.platform || teacher.preferredPlatform,
      },
    });
    await this.notifications.create({
      userId: teacher.userId,
      type: 'LESSON_REQUEST',
      title: 'New lesson request',
      body: `${student.user.firstName} requested a lesson.`,
      link: '/dashboard/lessons',
    });
    return lesson;
  }

  async list(userId: string, role: Role) {
    const where =
      role === Role.TEACHER
        ? { teacher: { userId } }
        : { student: { userId } };
    const rows = await this.prisma.lesson.findMany({
      where,
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        review: true,
      },
      orderBy: { startAt: 'desc' },
    });
    return rows.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      startAt: lesson.startAt,
      endAt: lesson.endAt,
      status: lesson.status,
      platform: lesson.platform,
      meetingUrl: lesson.meetingUrl,
      canJoin: this.canJoin(lesson.startAt, lesson.endAt, lesson.status, lesson.meetingUrl),
      hasReview: Boolean(lesson.review),
      student: {
        firstName: lesson.student.user.firstName,
        lastName: lesson.student.user.lastName,
      },
      teacher: {
        firstName: lesson.teacher.user.firstName,
        lastName: lesson.teacher.user.lastName,
        slug: lesson.teacher.slug,
        photoUrl: lesson.teacher.photoUrl,
      },
    }));
  }

  async update(teacherUserId: string, lessonId: string, dto: {
    status?: LessonStatus;
    meetingUrl?: string;
    startAt?: string;
    platform?: MeetingPlatform;
    description?: string;
  }) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) throw new ForbiddenException();
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { student: { include: { user: true } }, teacher: { include: { user: true } } },
    });
    if (!lesson || lesson.teacherId !== teacher.id) {
      throw new NotFoundException('Lesson not found');
    }

    const data: {
      status?: LessonStatus;
      meetingUrl?: string;
      startAt?: Date;
      endAt?: Date;
      platform?: MeetingPlatform;
      description?: string;
    } = {};
    if (dto.status) data.status = dto.status;
    if (dto.meetingUrl !== undefined) data.meetingUrl = dto.meetingUrl;
    if (dto.platform) data.platform = dto.platform;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.startAt) {
      const duration = lesson.endAt.getTime() - lesson.startAt.getTime();
      data.startAt = new Date(dto.startAt);
      data.endAt = new Date(data.startAt.getTime() + duration);
    }

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    if (dto.status === 'SCHEDULED' || dto.meetingUrl) {
      await this.notifications.create({
        userId: lesson.student.userId,
        type: 'LESSON_UPDATE',
        title: 'Lesson updated',
        body: `${lesson.teacher.user.firstName} updated your lesson.`,
        link: '/dashboard/lessons',
      });
    }
    return updated;
  }

  async complete(teacherUserId: string, lessonId: string) {
    return this.update(teacherUserId, lessonId, { status: LessonStatus.COMPLETED });
  }

  private canJoin(
    startAt: Date,
    endAt: Date,
    status: LessonStatus,
    meetingUrl: string | null,
  ) {
    if (!meetingUrl) return false;
    if (!['SCHEDULED', 'ACCEPTED'].includes(status)) return false;
    const now = Date.now();
    const openFrom = startAt.getTime() - 15 * 60 * 1000;
    return now >= openFrom && now <= endAt.getTime() + 30 * 60 * 1000;
  }
}
