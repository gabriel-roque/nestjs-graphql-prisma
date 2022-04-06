import { createUser, createUsers } from './utils/user.util';
import { ConfigModule } from '@nestjs/config';
import { config, DEPENDENCIES_AUTH_MODULES } from 'src/configs';

import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

import { PasswordService } from '../services/password.service';
import { UserService } from '../services/user.service';
import { JwtDto } from 'src/modules/auth/dto/jwt.dto';
import { TokenService } from 'src/modules/auth/services/token.service';
import { EmailService } from 'src/modules/email/services/email.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { OrderDirection } from 'src/modules/prisma/resolvers/order/order-direction';

import { UsersOrderBy } from '../dto/order-users.input';

import * as dotenv from 'dotenv';
import * as faker from 'faker';
import * as jwt from 'jsonwebtoken';

describe(UserService.name, () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    typeEntity: {
      findFirst: jest.fn(),
    },
    registrationDocuments: {
      findMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    dotenv.config();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...DEPENDENCIES_AUTH_MODULES,
        ConfigModule.forRoot({ isGlobal: true, load: [config] }),
      ],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        UserService,
        PasswordService,
        TokenService,
        EmailService,
      ],
    }).compile();

    service = await module.resolve<UserService>(UserService);
  });

  beforeEach(() => {
    mockPrismaService.user.count.mockReset();
    mockPrismaService.user.findMany.mockReset();
    mockPrismaService.user.findFirst.mockReset();
    mockPrismaService.user.update.mockReset();
    mockPrismaService.user.create.mockReset();
    mockPrismaService.registrationDocuments.findMany.mockReset();
    service.setAllowOperation(null);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When list user paginated', () => {
    it('Should be return user list', async () => {
      const users = createUsers({ unit: 10 });

      mockPrismaService.user.findMany.mockReturnValue(users);
      mockPrismaService.user.count.mockReturnValue(users.length);

      const result = await service.list(
        { skip: 0, take: 50 },
        { direction: OrderDirection.desc, orderBy: UsersOrderBy.name },
      );
      expect(result.nodes.length).toEqual(users.length);
      expect(result.hasNextPage).toBeFalsy();
      expect(result.totalCount).toEqual(10);
    });
  });

  describe('When get user', () => {
    it('Should be return user by id', async () => {
      const mockUser = createUser();
      mockPrismaService.user.findFirst.mockReturnValue(mockUser);

      const user = await service.getUser(mockUser.id);
      expect(user.id).toEqual(user.id);
    });

    it('Should be return user by email', async () => {
      const mockUser = createUser();
      mockPrismaService.user.findFirst.mockReturnValue(mockUser);

      const user = await service.getUserByEmail(mockUser.id);
      expect(user.id).toEqual(user.id);
    });
  });

  describe('When update user', () => {
    it('Should be return user updated', async () => {
      const mockUser = createUser({ name: 'Luke Skywalker' });
      mockPrismaService.user.update.mockReturnValue(mockUser);

      const user = await service.updateUser(mockUser.id, {
        ...mockUser,
        name: 'Luke Skywalker',
      });

      expect(user.name).toEqual('Luke Skywalker');
    });

    it('Should be return user updated with admin operation', async () => {
      const mockUser = createUser();
      mockPrismaService.user.update.mockReturnValue(mockUser);
      service.setAllowOperation(true);

      const user = await service.updateUser(mockUser.id, {
        ...mockUser,
        userId: mockUser.id,
      });

      expect(user.id).toEqual(mockUser.id);
    });

    it('Should be return exception when user updated with admin operation', async () => {
      const mockUser = createUser();
      mockPrismaService.user.update.mockReturnValue(mockUser);
      service.setAllowOperation(true);

      await service
        .updateUser(mockUser.id, {
          ...mockUser,
        })
        .catch((e) => {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toEqual('`userId` é obrigatório');
        });
    });
  });

  describe('When user change password', () => {
    it('Should be change password user', async () => {
      const password = 'jediOrder@#66';
      const mockUser = createUser({ password });

      await service.changePassword(mockUser.id, mockUser.password, {
        oldPassword: password,
        newPassword: faker.internet.password(),
      });
    });

    it('Should be return exception when user input invalid old password', async () => {
      const password = 'jediOrder@#66';
      const mockUser = createUser({ password });

      await service
        .changePassword(mockUser.id, mockUser.password, {
          oldPassword: 'darkSide@#87',
          newPassword: faker.internet.password(),
        })
        .catch((e) => {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toEqual('Senha inválida');
        });
    });
  });

  describe('When user sign up', () => {
    it('Should be return user created by sign up', async () => {
      const mockUser = createUser();
      mockPrismaService.user.create.mockImplementation(({ data }) => {
        mockUser.id = data.id;
        return { ...mockUser, id: data.id, emailToken: data.emailToken };
      });

      const user = await service.signUp(mockUser);
      expect(user).toHaveProperty('emailToken');
      const emailToken = jwt.decode(user.emailToken) as JwtDto;
      expect(emailToken).toHaveProperty('userId');
      expect(emailToken.userId).toEqual(mockUser.id);
    });

    it('Should be return expection when conflict email', async () => {
      const user = createUser();
      mockPrismaService.user.create.mockRejectedValue(
        new PrismaClientKnownRequestError('', 'P2002', ''),
      );

      await service.signUp(user).catch((e) => {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('Email já está em uso.');
      });
    });

    it('Should be return expection when failed sign up', async () => {
      const user = createUser();
      mockPrismaService.user.create.mockRejectedValue(new Error());

      await service.signUp(user).catch((e) => {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual('Falha ao cadastrar usuário');
      });
    });
  });
});
