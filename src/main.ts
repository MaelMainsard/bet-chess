import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'process';
import { setupSwagger } from './doc/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  setupSwagger(app);

  await app.listen(3000,'0.0.0.0');
}
bootstrap();
