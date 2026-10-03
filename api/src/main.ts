import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { handleBullBoardAuth } from './auth/bull-board-auth.hook';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const fastify = app.getHttpAdapter().getInstance();

  if (process.env.ENABLE_BULL_BOARD === 'true') {
    fastify.addHook('onRequest', async (request: any, reply: any) => {
      const allowed = handleBullBoardAuth(
        request,
        reply,
        process.env.BULL_BOARD_USER,
        process.env.BULL_BOARD_PASSWORD,
      );
      if (!allowed) {
        return reply;
      }
    });
  }

  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    if (!corsOrigins || corsOrigins.length === 0) {
      throw new Error('CORS_ORIGINS must be configured in production.');
    }
    if (corsOrigins.includes('*')) {
      throw new Error(
        'Wildcard "*" origin is not permitted in CORS_ORIGINS in production.',
      );
    }
    app.enableCors({ origin: corsOrigins, credentials: true });
  } else {
    app.enableCors(
      corsOrigins?.length
        ? { origin: corsOrigins, credentials: true }
        : { origin: true, credentials: true },
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Lang Clips API')
    .setDescription('API para gerenciamento de vídeos com IA.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3333);
  console.log('Ambiente:', process.env.NODE_ENV);
  if (process.env.NODE_ENV == 'development') {
    console.log(
      'Servidor rodando em:',
      'http://localhost:' + (process.env.PORT ?? 3333),
    );
    console.log(
      'Documentação em:',
      'http://localhost:' + (process.env.PORT ?? 3333) + '/docs',
    );
    console.log(
      'Bull Board em:',
      'http://localhost:' + (process.env.PORT ?? 3333) + '/admin/queues',
    );
  }
}
void bootstrap();
