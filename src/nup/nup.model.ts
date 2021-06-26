import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Nup {
  @Field(() => ID)
  id: string;
}
