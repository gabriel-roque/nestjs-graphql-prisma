import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/configs/config.interface';

import { Injectable } from '@nestjs/common';

import { compare, hash } from 'bcrypt';
import { v4 } from 'uuid';

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): string | number {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const saltOrRounds = securityConfig.bcryptSaltOrRound;

    return Number.isInteger(Number(saltOrRounds))
      ? Number(saltOrRounds)
      : saltOrRounds;
  }

  constructor(private configService: ConfigService) {}

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds);
  }

  randomPassword(): Promise<string> {
    return hash(v4(), this.bcryptSaltRounds);
  }
}
