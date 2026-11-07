import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { LessonsModule } from './lessons/lessons.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TeachersModule } from './teachers/teachers.module';
import { UploadsModule } from './uploads/uploads.module';
import { WalletsModule } from './wallets/wallets.module';
import { SettingsModule } from './settings/settings.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 80 }],
    }),
    PrismaModule,
    AuthModule,
    TeachersModule,
    StudentsModule,
    WalletsModule,
    EnquiriesModule,
    MessagesModule,
    LessonsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    UploadsModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
