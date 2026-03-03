import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';
  const allowed = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const o = origin.toLowerCase();
      const ok =
        allowed.includes(o) ||
        o.endsWith('.vercel.app') ||
        o === 'http://localhost:3000' ||
        o === 'https://localhost:3000';
      if (ok) callback(null, true);
      else callback(new Error('CORS'), false);
    },
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  const port = Number(process.env.PORT) || Number(process.env.API_PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 CTN Backend API running on http://localhost:${port}`);
}

bootstrap();
