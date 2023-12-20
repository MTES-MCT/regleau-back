import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeormStore } from 'connect-typeorm';
import { Session } from './core/entities/session.entity';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // TODO à modifier en PROD
  app.enableCors({
    origin: '*',
    exposedHeaders: ['content-disposition'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api');

  // OpenAPI
  const options = new DocumentBuilder()
    .setTitle('API VigiEau')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  // Authentication & Session
  const configService = app.get(ConfigService);
  const sessionRepository = app.get(DataSource).getRepository(Session);
  app.use(
    session({
      name: 'regleau_session',
      secret: configService.get('SESSION_SECRET'), // to sign session id
      resave: false, // will default to false in near future: https://github.com/expressjs/session#resave
      saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
      rolling: true, // keep session alive
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // session expires in one week, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
        domain: configService.get('DOMAIN'),
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get('PORT'));
}

bootstrap();
