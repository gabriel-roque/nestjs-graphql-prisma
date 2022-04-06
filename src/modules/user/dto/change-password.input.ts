import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @Field()
  @IsNotEmpty()
  token: string;
}

@InputType()
export class RequestResetPasswordInput {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
