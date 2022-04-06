import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsUUID, IsBoolean } from 'class-validator';

@InputType()
export class RequestConfirmEmailInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@InputType()
export class ChangeStatusEmailUserInput {
  @Field()
  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
