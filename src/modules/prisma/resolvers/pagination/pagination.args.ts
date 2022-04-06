import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PaginationArgs {
  @Field()
  skip?: number;

  @Field()
  take?: number;
}
