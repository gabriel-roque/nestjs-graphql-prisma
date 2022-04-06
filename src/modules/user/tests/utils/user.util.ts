import { config } from 'src/configs';

import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import * as faker from 'faker';
import { range } from 'lodash';

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, config().security.bcryptSaltOrRound);
}

export function createUser(data?: {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  emailToken?: string;
  passwordToken?: string;
  typeEntityId?: number;
  confirm?: boolean;
}): User {
  return {
    id: data?.id || faker.datatype.uuid(),
    email: data?.email || faker.internet.email(),
    name: data?.name || faker.name.firstName(),
    password:
      (data?.password && hashPassword(data.password)) ||
      hashPassword(faker.internet.password()),
    emailToken: data?.emailToken || null,
    passwordToken: data?.passwordToken || null,
    confirm: data?.confirm !== undefined ? data.confirm : false,
    isValid: true,
    createdAt: new Date(),
    updatedAt: null,
  };
}

export function createUsers(data?: { unit: number; typeEntityId?: number }) {
  return range(data.unit).map(() =>
    createUser({ typeEntityId: data.typeEntityId }),
  );
}
