import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/configs';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Operations } from '../enum/operations.enum';

import { Token } from '../entities/token.entity';

import { JwtDto } from '../dto/jwt.dto';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  generateTokenConfirm(
    type: Operations.EmailConfirm | Operations.ResetPassword,
    userId: string,
  ): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    let expiresIn = '';

    switch (type) {
      case 'email':
        expiresIn = securityConfig.confirmIn;
        break;
      case 'password':
        expiresIn = securityConfig.passwordIn;
        break;
    }

    return this.jwtService.sign(
      { operation: type, userId },
      {
        secret: this.configService.get('JWT_CONFIRM_SECRET'),
        expiresIn,
      },
    );
  }

  generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  decodeToken(token: string): JwtDto {
    return this.jwtService.decode(token) as JwtDto;
  }

  verifyTokenConfirm(token: string): JwtDto {
    return this.jwtService.verify(token, {
      secret: this.configService.get('JWT_CONFIRM_SECRET'),
    }) as JwtDto;
  }
}
