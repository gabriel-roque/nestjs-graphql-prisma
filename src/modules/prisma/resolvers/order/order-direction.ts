import { registerEnumType } from '@nestjs/graphql';

export enum OrderDirection {
  asc = 'asc',
  desc = 'desc',
}

registerEnumType(OrderDirection, {
  name: 'OrderDirection',
  description:
    'Likely likely to sort a list of items when presented with an argument `orderBy`.',
});
