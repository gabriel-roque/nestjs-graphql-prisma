import { Field, ObjectType } from '@nestjs/graphql';

import { BaseEntity } from 'src/modules/prisma/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';

@ObjectType()
export class File extends BaseEntity {
  @Field()
  name: string;

  @Field()
  mimeType: string;

  @Field(() => User)
  user: User;

  userId: string;

  @Field(() => User)
  createdBy: User;

  createdById: string;

  @Field(() => User, { nullable: true })
  updatedBy?: User;

  updatedById?: string;
}
