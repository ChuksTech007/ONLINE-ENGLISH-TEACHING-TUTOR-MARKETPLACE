import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const uploads = join(process.cwd(), 'uploads');
  for (const dir of [uploads, join(uploads, 'photos'), join(uploads, 'certificates')]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const allowed = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://englishtutor-eta.vercel.app',
  ].filter(Boolean) as string[];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });
  app.useStaticAssets(uploads, { prefix: '/uploads/' });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
