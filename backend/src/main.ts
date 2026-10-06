// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.set('trust proxy', 1); // behind Render's proxy — so rate limits see each visitor's real IP
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const allowedOrigins = process.env.FRONTEND_ORIGINS?.split(',').map((o) => o.trim());
  app.enableCors({ origin: allowedOrigins ?? true }); // true = allow all, used only if FRONTEND_ORIGINS isn't set yet

  const port = process.env.PORT || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Eschools API running on http://localhost:${port}`);
}
bootstrap();