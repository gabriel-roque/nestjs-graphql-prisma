import { ConfigModule } from '@nestjs/config';
import { config, DEPENDENCIES_AUTH_MODULES } from 'src/configs';
import { createUser } from 'src/modules/user/tests/utils/user.util';

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PasswordService } from 'src/modules/user/services/password.service';

import { Operations } from '../enum/operations.enum';

import { JwtDto } from '../dto/jwt.dto';

import * as bcrypt from 'bcrypt';
import * as faker from 'faker';
import * as jwt from 'jsonwebtoken';

const FAKE_SECRET_JWT = 'abc';

describe(AuthService.name, () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPasswordService = {
    validatePassword: jest.fn(),
    hashPassword: jest
      .fn()
      .mockImplementation((args) => bcrypt.hashSync(args, 10)),
  };

  const mockTokenService = {
    decodeToken: jest.fn(),
    generateTokenConfirm: jest.fn(),
    generateTokens: jest.fn().mockImplementation((args) => {
      return {
        accessToken: jwt.sign(args, FAKE_SECRET_JWT),
        refreshToken: jwt.sign(args, FAKE_SECRET_JWT),
      };
    }),
    verifyTokenConfirm: jest
      .fn()
      .mockImplementation((token) => jwt.verify(token, FAKE_SECRET_JWT)),
    generateAccessToken: jest
      .fn()
      .mockImplementation(({ userId }) =>
        jwt.sign({ userId }, FAKE_SECRET_JWT),
      ),
    generateRefreshToken: jest
      .fn()
      .mockImplementation(({ userId }) =>
        jwt.sign({ userId }, FAKE_SECRET_JWT),
      ),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...DEPENDENCIES_AUTH_MODULES,
        ConfigModule.forRoot({ isGlobal: true, load: [config] }),
      ],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = await module.resolve<AuthService>(AuthService);
  });

  beforeEach(() => {
    mockPrismaService.user.findUnique.mockReset();
    mockPrismaService.user.findMany.mockReset();
    mockPrismaService.user.findFirst.mockReset();
    mockPrismaService.user.update.mockReset();
    mockPasswordService.validatePassword.mockReset();
    mockTokenService.generateTokenConfirm.mockReset();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When user to login', () => {
    it('Should be return access token after user login', async () => {
      const user = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(user);
      mockPrismaService.user.findMany.mockReturnValue([]);
      mockPasswordService.validatePassword.mockReturnValue(true);

      const { accessToken } = await service.login(user.email, user.password);
      const decode = jwt.decode(accessToken) as JwtDto;
      expect(decode.userId).toEqual(user.id);
    });

    it('Should be return exception when user not found', async () => {
      const user = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(null);

      await service.login(user.email, user.password).catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('Nenhum usuário encontrado.');
      });
    });

    it('Should be return exception when password is invalid', async () => {
      const user = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(user);
      mockPasswordService.validatePassword.mockReturnValue(false);

      await service.login(user.email, user.password).catch((e) => {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Senha inválida');
      });
    });

    it('Should be return exception when user is not belongs company', async () => {
      const user = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(user);
      mockPasswordService.validatePassword.mockReturnValue(true);

      await service.login(user.email, user.password).catch((e) => {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toEqual('Usuário não faz parte desta Organização');
      });
    });
  });

  describe('When user to login with link access', () => {
    it('Should be return token access', async () => {
      const mockUser = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(mockUser);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const { accessToken, user } = await service.loginLinkAccess(
        mockUser.email,
      );
      expect(user.id).toEqual(mockUser.id);
      expect(user.email).toEqual(mockUser.email);

      const decode = jwt.decode(accessToken) as JwtDto;
      expect(decode.userId).toEqual(user.id);
    });

    it('Should be return expection when user not found', async () => {
      const mockUser = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(null);

      await service.loginLinkAccess(mockUser.email).catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('Nenhum usuário encontrado.');
      });
    });

    it('Should be return expection when user not belogns company', async () => {
      const mockUser = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(mockUser);

      await service.loginLinkAccess(mockUser.email).catch((e) => {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toEqual('Usuário não faz parte desta Organização');
      });
    });
  });

  describe('When validate user', () => {
    it('Should be return user', async () => {
      const mockUser = createUser();
      mockPrismaService.user.findUnique.mockReturnValue(mockUser);

      const user = await service.validateUser(mockUser.id);
      expect(user.id).toEqual(mockUser.id);
    });
  });

  describe('When get user from token', () => {
    it('Should be return user from token', async () => {
      const mockUser = createUser();
      const token = jwt.sign({ userId: mockUser.id }, FAKE_SECRET_JWT);
      mockTokenService.decodeToken.mockReturnValue(jwt.decode(token));
      mockPrismaService.user.findUnique.mockReturnValue(mockUser);

      const user = await service.getUserFromToken(token);
      expect(user.id).toEqual(mockUser.id);
    });
  });

  describe('When user confirm email', () => {
    it('Should be confirm email user', async () => {
      const userId = faker.datatype.uuid();
      const token = jwt.sign(
        { userId, operation: Operations.EmailConfirm },
        FAKE_SECRET_JWT,
      );

      const mockUser = createUser({ id: userId, emailToken: token });

      mockPrismaService.user.findFirst.mockReturnValue(mockUser);
      mockPrismaService.user.update.mockReturnValue({ count: 1 });

      await service.confirmEmail(token);
    });

    it('Should be return expection confirm email user when token is invalid', async () => {
      const userId = faker.datatype.uuid();
      const token = jwt.sign(
        { userId, operation: Operations.EmailConfirm },
        FAKE_SECRET_JWT,
      );

      const mockUser = createUser({ id: userId, emailToken: token });
      mockPrismaService.user.findFirst.mockReturnValue(mockUser);

      const invalidToken = jwt.sign(
        { userId: faker.datatype.uuid(), operation: Operations.EmailConfirm },
        FAKE_SECRET_JWT,
      );

      await service.confirmEmail(invalidToken).catch((e) => {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toEqual('Token inválido.');
      });
    });
  });

  describe('When user reset password', () => {
    it('Should be reset password user', async () => {
      const userId = faker.datatype.uuid();
      const token = jwt.sign(
        { userId, operation: Operations.ResetPassword },
        FAKE_SECRET_JWT,
      );

      const mockUser = createUser({ id: userId, passwordToken: token });

      mockPrismaService.user.findFirst.mockReturnValue(mockUser);
      mockPrismaService.user.update.mockReturnValue({ count: 1 });

      await service.resetPassword(token, faker.internet.password());
    });

    it('Should be return expection reset password user when token is invalid', async () => {
      const userId = faker.datatype.uuid();
      const token = jwt.sign(
        { userId, operation: Operations.ResetPassword },
        FAKE_SECRET_JWT,
      );

      const mockUser = createUser({ id: userId, passwordToken: token });

      mockPrismaService.user.findFirst.mockReturnValue(mockUser);
      mockPrismaService.user.update.mockReturnValue({ count: 1 });

      const invalidToken = jwt.sign(
        { userId: faker.datatype.uuid(), operation: Operations.ResetPassword },
        FAKE_SECRET_JWT,
      );

      await service
        .resetPassword(invalidToken, faker.internet.password())
        .catch((e) => {
          expect(e).toBeInstanceOf(UnauthorizedException),
            expect(e.message).toEqual('Token inválido');
        });
    });
  });

  describe('When request new confirm email token', () => {
    it('Should return user with new email token', async () => {
      const user = createUser({ confirm: false });

      mockPrismaService.user.findUnique.mockReturnValue(user);
      const newToken = jwt.sign(
        { operation: Operations.EmailConfirm, userId: user.id },
        FAKE_SECRET_JWT,
      );
      mockPrismaService.user.update.mockReturnValue({
        ...user,
        emailToken: newToken,
      });

      mockTokenService.generateTokenConfirm.mockRejectedValue(newToken);

      const userUpdated = await service.setNewConfirmEmailToken(user.id);

      expect(userUpdated.emailToken).toBeDefined();
      expect(userUpdated.confirm).toEqual(false);
      const decode = jwt.decode(userUpdated.emailToken) as JwtDto;
      expect(decode.operation).toEqual(Operations.EmailConfirm);
      expect(decode.userId).toEqual(user.id);
    });

    it('Should expection when not found user', async () => {
      const user = createUser({ confirm: false });

      mockPrismaService.user.findUnique.mockReturnValue(null);

      await service.setNewConfirmEmailToken(user.id).catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual('Nenhum usuário encontrado.');
      });
    });
  });
});
