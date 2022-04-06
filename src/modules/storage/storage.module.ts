import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './services/storage.service';

import { UserModule } from '../user/user.module';
import { StorageResolver } from './resolvers/storage.resolver';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageService, PrismaService, StorageResolver],
  imports: [UserModule],
  exports: [StorageService],
})
export class StorageModule {}
