import { Config } from './config.interface';

import * as dotenv from 'dotenv';

dotenv.config();

const config: Config = {
  nest: {
    port: Number(process.env.PORT),
  },
  cors: {
    enabled: true,
  },
  throttler: {
    ttl: 60,
    limit: 100,
  },
  graphql: {
    playgroundEnabled: process.env.PLAYGROUND_GRAPHQL === 'true' ? true : false,
    debug: true,
    sortSchema: false,
  },
  security: {
    expiresIn: '7d',
    refreshIn: '14d',
    confirmIn: '2d',
    passwordIn: '1d',
    bcryptSaltOrRound: 10,
  },
  email: {
    from: 'Name <name@domain.com>',
    replyTo: 'Contact <contact@domain.com>',
  },
  storage: {
    maxSize: '20971520', // 20MB
  },
};

export default (): Config => config;
