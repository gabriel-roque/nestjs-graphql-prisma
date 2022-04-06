import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { EmailService } from 'src/modules/email/services/email.service';
import {
  RequestResetPasswordInput,
  ResetPasswordInput,
} from 'src/modules/user/dto/change-password.input';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

import { Roles } from '../decorators/role.decorator';
import { Role } from '../enum/role.enum';

import { RequestConfirmEmailInput } from '../dto/confirm.input';
import { LoginInput, LoginLinkAccessInput } from '../dto/login.input';
import { SignupInput } from '../dto/signup.input';
import { Auth } from '../entities/auth.entity';
import { Token } from '../entities/token.entity';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly userService: UserService,
    private emailService: EmailService,
    private tokenService: TokenService,
  ) {}

  @Mutation(() => Auth)
  async signup(@Args('data') data: SignupInput): Promise<Token> {
    const user = await this.userService.signUp(data);

    await this.emailService.sendEmailConfirmation({
      name: user.name,
      email: user.email,
      emailToken: user.emailToken,
    });

    return this.tokenService.generateTokens({
      userId: user.id,
    });
  }

  @Mutation(() => Auth)
  async login(@Args('data') { email, password }: LoginInput) {
    const { accessToken, refreshToken } = await this.auth.login(
      email.toLowerCase(),
      password,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  @Mutation(() => Boolean)
  async loginLinkAccess(
    @Args('data') { email }: LoginLinkAccessInput,
  ): Promise<boolean> {
    const { user, accessToken } = await this.auth.loginLinkAccess(
      email.toLowerCase(),
    );
    await this.emailService.sendEmailLinkAccess({
      email: user.email,
      name: user.name,
      token: accessToken,
    });

    return !!user;
  }

  @ResolveField(() => User)
  @Roles(Role.Admin, Role.User)
  async user(@Parent() token: Token) {
    return await this.auth.getUserFromToken(token.accessToken);
  }

  @Mutation(() => Token)
  async refreshToken(@Args('token') token: string) {
    return this.tokenService.refreshToken(token);
  }

  @Mutation(() => Token)
  async confirmEmail(@Args('token') token: string) {
    return await this.auth.confirmEmail(token);
  }

  @Mutation(() => Boolean)
  async requestConfirmEmail(@Args('data') data: RequestConfirmEmailInput) {
    const user = await this.auth.setNewConfirmEmailToken(data.email);

    await this.emailService.sendEmailConfirmation({
      name: user.name,
      email: user.email,
      emailToken: user.emailToken,
    });

    return !!user;
  }

  @Mutation(() => Token)
  async resetPassword(@Args('data') data: ResetPasswordInput) {
    return await this.auth.resetPassword(data.token, data.newPassword);
  }

  @Mutation(() => Boolean)
  async requestResetPassword(
    @Args('data') data: RequestResetPasswordInput,
  ): Promise<boolean> {
    const user = await this.auth.requestResetPassword(data.email);

    await this.emailService.sendEmailResetPassword({
      email: user.email,
      name: user.name,
      passwordToken: user.passwordToken,
    });

    if (user) return true;
    return false;
  }
}
