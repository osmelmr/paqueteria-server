import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { AgenciesModule } from './crud-modules/agencies/agencies.module.js';
import { GuidesModule } from './crud-modules/guides/guides.module.js';
import { LocationsModule } from './crud-modules/locations/locations.module.js';
import { PackageEntryModule } from './package-entry/package-entry.module.js';
import { PackagesModule } from './crud-modules/packages/packages.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProvincesModule } from './crud-modules/provinces/provinces.module.js';
import { MunicipesModule } from './crud-modules/municipes/municipes.module.js';
import { RecipientsModule } from './crud-modules/recipients/recipients.module.js';
import { StatusesModule } from './crud-modules/statuses/statuses.module.js';
import { UsersModule } from './crud-modules/users/users.module.js';
import { CommonModule } from './common/common.module.js';
import { BusinessModule } from './business/business.module.js';
import { AimoduleModule } from './aimodule/aimodule.module.js';

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
    CommonModule,
    BusinessModule,
    AimoduleModule,
    MunicipesModule,
  ],
})
export class AppModule {}
