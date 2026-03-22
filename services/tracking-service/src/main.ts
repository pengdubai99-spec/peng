import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files (viewer.html etc.)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3004'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.TRACKING_SERVICE_PORT || 3005;
  await app.listen(port, '0.0.0.0');
  
  console.log(`📍 Tracking Service (WS) running on http://0.0.0.0:${port}`);
  console.log(`📺 Viewer: http://localhost:${port}/viewer.html`);
}
bootstrap();
