import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {ScheduleModule} from "@nestjs/schedule";
import {CacheModule, CacheInterceptor} from "@nestjs/cache-manager";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        typeormConfig,
        configuration
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    ThrottlerModule.forRoot([{
      ttl: configuration().RATE_LIMITER_TTL,
      limit: configuration().RATE_LIMITER_LIMIT,
    }]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
  ],
})
export class AppModule {}
