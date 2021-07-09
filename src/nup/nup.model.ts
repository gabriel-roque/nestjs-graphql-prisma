import { Field, ID, ObjectType } from '@nestjs/graphql';
import { loggerMiddleware } from 'src/middlewares/grapgql.middlware';

@ObjectType()
export class Nup {
  @Field(() => ID, { middleware: [loggerMiddleware] })
  id: string;
}
