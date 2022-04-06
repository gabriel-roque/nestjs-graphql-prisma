import { Module } from '@nestjs/common';

import { EmailService } from '../email/services/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './services/password.service';
import { UserService } from './services/user.service';
import { ValidationService } from './services/validation.service';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    UserResolver,
    UserService,
    PasswordService,
    PrismaService,
    EmailService,
    ValidationService,
  ],
  exports: [UserService, ValidationService],
})
export class UserModule {}
