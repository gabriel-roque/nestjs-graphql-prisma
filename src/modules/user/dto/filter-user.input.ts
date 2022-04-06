import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FilterListUsers {
  @Field(() => [Number], {
    defaultValue: null,
    nullable: true,
  })
  @Field(() => String, { defaultValue: null, nullable: true })
  omni?: string;

  @Field(() => Boolean, {
    defaultValue: null,
    nullable: true,
  })
  isValid?: boolean;
}
