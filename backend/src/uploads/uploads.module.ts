import { Module } from '@nestjs/common';
import { TeachersModule } from '../teachers/teachers.module';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [TeachersModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
