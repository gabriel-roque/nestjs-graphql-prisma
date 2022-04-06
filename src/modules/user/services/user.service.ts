import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { EmailConflict, UserIdIsRequired } from 'src/errors';

import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { SignupInput } from 'src/modules/auth/dto/signup.input';
import { Operations } from 'src/modules/auth/enum/operations.enum';
import { Role } from 'src/modules/auth/enum/role.enum';
import { TokenService } from 'src/modules/auth/services/token.service';
import { haveNextPage } from 'src/modules/prisma/resolvers/pagination/pagination';
import { PaginationArgs } from 'src/modules/prisma/resolvers/pagination/pagination.args';

import { ChangePasswordInput } from '../dto/change-password.input';
import { FilterListUsers } from '../dto/filter-user.input';
import { OrderListUsers } from '../dto/order-users.input';
import {
  UpdateStatusUserInput,
  UpdateUserInput,
  UserDataInput,
} from '../dto/user.input';

import { v4 } from 'uuid';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  private allowOperation: boolean;

  constructor(
    @Inject(CONTEXT) private context,
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
  ) {
    this.allowOperation = this.context?.req?.user?.isAdmin;
  }

  public setAllowOperation(value: boolean) {
    this.allowOperation = value;
  }

  async list(
    paginate: PaginationArgs,
    order: OrderListUsers,
    filter?: FilterListUsers,
  ) {
    const nodes = await this.prisma.user.findMany({
      skip: paginate.skip,
      take: paginate.take,
      orderBy: { [order.orderBy]: order.direction },
      where: {
        userRoles: { none: { roleId: Role.Admin } },
        ...(filter?.isValid && { isValid: filter.isValid }),
        ...(filter?.omni && {
          name: { contains: filter.omni, mode: 'insensitive' },
        }),
      },
    });
    const totalCount = await this.prisma.user.count({
      where: { userRoles: { none: { roleId: Role.Admin } } },
    });
    const hasNextPage = haveNextPage(paginate.skip, paginate.take, totalCount);
    return { nodes, totalCount, hasNextPage };
  }

  async getUser(userId: string): Promise<User> {
    return await this.prisma.user.findFirst({ where: { id: userId } });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  async updateUser(userId: string, params: UpdateUserInput): Promise<User> {
    const userOwnId = this.allowOperation ? params.userId : userId;
    if (this.allowOperation && !params?.userId) throw UserIdIsRequired;

    return await this.prisma.user.update({
      data: {
        name: params.name,
      },
      where: {
        id: userOwnId,
      },
    });
  }

  async changePassword(
    userId: string,
    userPassword: string,
    changePassword: ChangePasswordInput,
  ): Promise<User> {
    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      userPassword,
    );

    if (!passwordValid) throw new BadRequestException('Senha inválida');

    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword,
    );

    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }

  async signUp(payload: SignupInput): Promise<User> {
    try {
      const userId = v4();
      const emailToken = this.tokenService.generateTokenConfirm(
        Operations.EmailConfirm,
        userId,
      );

      return await this.createUser({
        ...payload,
        id: userId,
        emailToken,
      });
    } catch (e) {
      if (e.code === 'P2002') throw EmailConflict;
      throw new Error('Failed in signup');
    }
  }

  async createUser(data: UserDataInput): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      data.password,
    );

    return await this.prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        userRoles: { create: { roleId: Number(Role.User) } },
      },
    });
  }

  async updateStatusUser(data: UpdateStatusUserInput) {
    return await this.prisma.user.update({
      where: { id: data.userId },
      data: { isValid: data.status },
    });
  }
}
