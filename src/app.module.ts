import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { AgenciesModule } from './business/agencies/agencies.module.js';
import { GuidesModule } from './business/guides/guides.module.js';
import { LocationsModule } from './business/locations/locations.module.js';
import { PackagesModule } from './business/packages/packages.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProvincesModule } from './business/provinces/provinces.module.js';
import { MunicipesModule } from './business/municipes/municipes.module.js';
import { RecipientsModule } from './business/recipients/recipients.module.js';
import { StatusesModule } from './business/statuses/statuses.module.js';
import { UsersModule } from './business/users/users.module.js';
import { CommonModule } from './common/common.module.js';
import { AiModule } from './ai/ai.module.js';
import { RoutesModule } from './business/routes/routes.module.js';
import { StatisticsModule } from './statistics/statistics.module.js';
import { AppController } from './app.controller.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProvincesModule,
    StatusesModule,
    LocationsModule,
    RecipientsModule,
    PackagesModule,
    GuidesModule,
    AgenciesModule,
    CommonModule,
    MunicipesModule,
    AiModule,
    RoutesModule,
    StatisticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
