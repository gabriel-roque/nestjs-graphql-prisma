import { Args, Query, Resolver, Context } from '@nestjs/graphql';
import { Nup } from './nup.model';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Resolver(() => Nup)
export class NupResolver {
  @Query(() => [Nup])
  async nups(@Args('id', { type: () => String, nullable: true }) id: string) {
    return await prisma.nup.findMany({
      where: { id: id },
    });
  }
}
