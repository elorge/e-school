// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
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