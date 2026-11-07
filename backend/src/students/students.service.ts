import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async dashboard(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    const [enquiries, upcoming, completed, teachers] = await Promise.all([
      this.prisma.enquiry.count({ where: { studentId: student.id } }),
      this.prisma.lesson.count({
        where: {
          studentId: student.id,
          status: { in: ['REQUESTED', 'ACCEPTED', 'SCHEDULED'] },
          startAt: { gte: new Date() },
        },
      }),
      this.prisma.lesson.count({
        where: { studentId: student.id, status: 'COMPLETED' },
      }),
      this.prisma.studentTeacherContact.count({ where: { studentId: student.id } }),
    ]);
    return {
      enquiries,
      upcomingLessons: upcoming,
      completedLessons: completed,
      teachers,
    };
  }

  async update(userId: string, data: { bio?: string; level?: string; goals?: string; timezone?: string }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    await this.prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        bio: data.bio,
        level: data.level,
        goals: data.goals,
      },
    });
    if (data.timezone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { timezone: data.timezone },
      });
    }
    return this.prisma.studentProfile.findUnique({
      where: { id: student.id },
      include: { user: true },
    });
  }
}
