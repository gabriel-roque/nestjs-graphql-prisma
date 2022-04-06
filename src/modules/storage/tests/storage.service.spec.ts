import { ConfigService } from '@nestjs/config';

import { Test, TestingModule } from '@nestjs/testing';

import { StorageService } from '../services/storage.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import * as dotenv from 'dotenv';

describe('StorageService', () => {
  let service: StorageService;

  beforeAll(async () => {
    dotenv.config();
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, ConfigService, PrismaService],
    }).compile();

    service = await module.resolve<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
