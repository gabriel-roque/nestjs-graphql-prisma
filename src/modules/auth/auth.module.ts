import { DEPENDENCIES_AUTH_MODULES } from 'src/configs';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { EmailService } from '../email/services/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../user/services/password.service';
import { UserService } from '../user/services/user.service';
import { ValidationService } from '../user/services/validation.service';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

import { RolesGuard } from './guards/roles.guard';

import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthResolver } from './resolvers/auth.resolver';

@Module({
  imports: [...DEPENDENCIES_AUTH_MODULES, PrismaModule],
  providers: [
    TokenService,
    AuthResolver,
    AuthService,
    PrismaService,
    JwtStrategy,
    EmailService,
    UserService,
    PasswordService,
    ValidationService,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
  exports: [JwtModule, JwtStrategy, AuthService, TokenService],
})
export class AuthModule {}
