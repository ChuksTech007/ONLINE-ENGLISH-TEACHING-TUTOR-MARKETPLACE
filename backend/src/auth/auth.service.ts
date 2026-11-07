import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { uniqueSlug } from '../common/utils/slug';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const COOKIE_NAME = 'access_token';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  cookieName() {
    return COOKIE_NAME;
  }

  async register(dto: RegisterDto) {
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be self-registered');
    }
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const slug = await uniqueSlug(
      `${dto.firstName} ${dto.lastName}`,
      async (value) =>
        Boolean(
          await this.prisma.teacherProfile.findUnique({ where: { slug: value } }),
        ),
    );

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: dto.role,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone,
          country: dto.country,
          timezone: dto.timezone || 'UTC',
          emailVerified: false,
        },
      });

      if (dto.role === Role.TEACHER) {
        const teacher = await tx.teacherProfile.create({
          data: {
            userId: created.id,
            slug,
            country: dto.country,
          },
        });
        await tx.wallet.create({ data: { teacherId: teacher.id } });
      } else {
        await tx.studentProfile.create({ data: { userId: created.id } });
      }

      await tx.emailVerifyToken.create({
        data: {
          userId: created.id,
          token: randomBytes(24).toString('hex'),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      return created;
    });

    return this.issue(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('This account has been suspended');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return this.issue(user.id, user.email, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: { include: { wallet: true } },
        studentProfile: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      country: user.country,
      timezone: user.timezone,
      emailVerified: user.emailVerified,
      status: user.status,
      teacher: user.teacherProfile
        ? {
            id: user.teacherProfile.id,
            slug: user.teacherProfile.slug,
            status: user.teacherProfile.status,
            featured: user.teacherProfile.featured,
            walletBalance: user.teacherProfile.wallet?.balance.toFixed(2) ?? '0.00',
          }
        : null,
      student: user.studentProfile
        ? { id: user.studentProfile.id, level: user.studentProfile.level }
        : null,
    };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerifyToken.findUnique({
      where: { token },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Verification link is invalid or expired');
    }
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
    await this.prisma.emailVerifyToken.delete({ where: { id: record.id } });
    return { verified: true };
  }

  private async issue(userId: string, email: string, role: Role) {
    const token = await this.jwt.signAsync({ sub: userId, email, role });
    const profile = await this.me(userId);
    return { token, user: profile };
  }
}
