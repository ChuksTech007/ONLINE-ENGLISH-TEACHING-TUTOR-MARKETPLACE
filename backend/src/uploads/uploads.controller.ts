import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TeachersService } from '../teachers/teachers.service';

const uploadDir = join(process.cwd(), 'uploads');

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class UploadsController {
  constructor(private teachers: TeachersService) {}

  @Post('photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(uploadDir, 'photos'),
        filename: (_req, file, cb) => {
          cb(null, `${randomBytes(12).toString('hex')}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
          cb(new BadRequestException('Only JPG, PNG and WEBP images are allowed'), false);
        } else cb(null, true);
      },
    }),
  )
  async photo(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const photoUrl = `/uploads/photos/${file.filename}`;
    await this.teachers.setPhoto(user.id, photoUrl);
    return { url: photoUrl };
  }

  @Post('certificate')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(uploadDir, 'certificates'),
        filename: (_req, file, cb) => {
          cb(null, `${randomBytes(12).toString('hex')}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async certificate(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const fileUrl = `/uploads/certificates/${file.filename}`;
    const saved = await this.teachers.addCertificate(
      user.id,
      file.originalname,
      fileUrl,
      file.originalname,
    );
    return saved;
  }
}
