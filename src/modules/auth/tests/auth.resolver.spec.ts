import { ConfigModule } from '@nestjs/config';
import { DEPENDENCIES_AUTH_MODULES } from 'src/configs';

import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { EmailService } from 'src/modules/email/services/email.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PasswordService } from 'src/modules/user/services/password.service';
import { UserService } from 'src/modules/user/services/user.service';
import { ValidationService } from 'src/modules/user/services/validation.service';

import { AuthResolver } from '../resolvers/auth.resolver';

import * as dotenv from 'dotenv';

describe(AuthResolver.name, () => {
  let resolver: AuthResolver;

  beforeAll(async () => {
    dotenv.config();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...DEPENDENCIES_AUTH_MODULES,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
      providers: [
        AuthResolver,
        AuthService,
        UserService,
        EmailService,
        TokenService,
        PrismaService,
        PasswordService,
        ValidationService,
      ],
    }).compile();

    resolver = await module.resolve<AuthResolver>(AuthResolver);
  });

  it('Should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
