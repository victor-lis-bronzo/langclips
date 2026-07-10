import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors();

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
bootstrap();
