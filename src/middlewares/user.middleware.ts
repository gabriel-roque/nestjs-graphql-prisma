import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';

import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ValidationService } from 'src/modules/user/services/validation.service';

import * as jwt from 'jsonwebtoken';

interface JWT {
  userId: string;
  email: string;
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    if (req.headers.authorization) {
      const { userId } = jwt.decode(
        String(req.headers.authorization).split(/ /g)[1],
      ) as JWT;

      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
        include: { userRoles: true },
      });

      if (user && !user.confirm)
        throw new ForbiddenException('User not confirmed');

      if (user) {
        delete user.password;
        req.user = user;
        req.user.isAdmin = await this.validationService.isAdmin(userId);
      }
    }
    next();
  }
}
