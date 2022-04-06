import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field()
  name: string;
}
