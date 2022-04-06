import config from './config';
import { ConfigService } from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

export const DEPENDENCIES_AUTH_MODULES = [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => {
      return {
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config().security.expiresIn,
        },
      };
    },
    inject: [ConfigService],
  }),
];
