import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { AgenciesModule } from './agencies/agencies.module.js';
import { GuidesModule } from './guides/guides.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { PackageEntryModule } from './package-entry/package-entry.module.js';
import { PackagesModule } from './packages/packages.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProvincesModule } from './provinces/provinces.module.js';
import { RecipientsModule } from './recipients/recipients.module.js';
import { StatusesModule } from './statuses/statuses.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProvincesModule,
    StatusesModule,
    LocationsModule,
    RecipientsModule,
    PackagesModule,
    PackageEntryModule,
    GuidesModule,
    AgenciesModule,
  ],
})
export class AppModule {}
