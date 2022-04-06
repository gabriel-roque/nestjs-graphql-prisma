import { ConfigService } from '@nestjs/config';

import { Test, TestingModule } from '@nestjs/testing';

import { StorageService } from '../services/storage.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { StorageController } from '../storage.controller';

describe('StorageController', () => {
  let controller: StorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, ConfigService, PrismaService],
      controllers: [StorageController],
    }).compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
