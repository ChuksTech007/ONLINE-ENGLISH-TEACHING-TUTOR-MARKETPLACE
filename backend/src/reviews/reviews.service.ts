import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(studentUserId: string, dto: {
    lessonId: string;
    rating: number;
    teachingQuality: number;
    communication: number;
    punctuality: number;
    comment: string;
  }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new ForbiddenException();
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
    });
    if (!lesson || lesson.studentId !== student.id) {
      throw new NotFoundException('Lesson not found');
    }
    if (lesson.status !== 'COMPLETED') {
      throw new BadRequestException('You can review a teacher after a completed lesson');
    }
    const existing = await this.prisma.review.findUnique({
      where: { lessonId: lesson.id },
    });
    if (existing) throw new BadRequestException('This lesson already has a review');

    const review = await this.prisma.review.create({
      data: {
        lessonId: lesson.id,
        studentId: student.id,
        teacherId: lesson.teacherId,
        rating: dto.rating,
        teachingQuality: dto.teachingQuality,
        communication: dto.communication,
        punctuality: dto.punctuality,
        comment: dto.comment,
      },
    });

    const agg = await this.prisma.review.aggregate({
      where: { teacherId: lesson.teacherId, hidden: false },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await this.prisma.teacherProfile.update({
      where: { id: lesson.teacherId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });
    return review;
  }
}
