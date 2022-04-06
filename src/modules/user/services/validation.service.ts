import { Injectable } from '@nestjs/common';

import { Role } from 'src/modules/auth/enum/role.enum';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async isAdmin(userId: string): Promise<boolean> {
    return await this.prisma.userRoles
      .count({
        where: { userId, roleId: Role.Admin },
      })
      .then((count) => (count ? true : false));
  }
}
