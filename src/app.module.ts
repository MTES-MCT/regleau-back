import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { ArreteCadreModule } from './arrete_cadre/arrete_cadre.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './core/entities/session.entity';
import { UserModule } from './user/user.module';
import { ZoneAlerteModule } from './zone_alerte/zone_alerte.module';
import { DataSource } from 'typeorm';
import { Region } from './core/entities/region.entity';
import { BassinVersant } from './core/entities/bassin_versant.entity';
import { Thematique } from './thematique/entities/thematique.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { DepartementModule } from './departement/departement.module';
import { UsageModule } from './usage/usage.module';
import { ThematiqueModule } from './thematique/thematique.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: `postgres://${process.env.DATABASE_USER}:${
          process.env.DATABASE_PASSWORD
        }@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${
          process.env.DATABASE_NAME
        }?${process.env.DATABASE_SSL_CERT ? 'sslmode=require' : ''}`,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        logging: ['test', 'dev', 'review', 'local'].includes(
          process.env.NODE_ENV,
        )
          ? ['error', 'schema']
          : false,
        migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
        cli: {
          migrationsDir: 'src/migrations',
        },
        synchronize: false,
        maxQueryExecutionTime: 1000,
        ssl: process.env.NODE_ENV !== 'local',
        extra:
          process.env.NODE_ENV !== 'local'
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : {},
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        await dataSource.synchronize();
        await dataSource.runMigrations();
        return dataSource;
      },
    }),
    TypeOrmModule.forFeature([Session, Region, BassinVersant]),
    // Rate limit, 300 requêtes maximum toutes les 15min par IP
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 15,
        limit: 300,
      },
    ]),
    HealthModule,
    ArreteCadreModule,
    AuthModule,
    UserModule,
    ZoneAlerteModule,
    ScheduleModule.forRoot(),
    DepartementModule,
    UsageModule,
    ThematiqueModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
