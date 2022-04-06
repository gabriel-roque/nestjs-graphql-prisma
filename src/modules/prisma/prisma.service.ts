import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import 'colors';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    if (process.env.LOG_SQL === 'true') {
      super({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          'info',
          'warn',
          'error',
        ],
      });

      const logger = new Logger(PrismaService.name);
      this.$on<any>('query', (e: Prisma.QueryEvent) => {
        logger.log('===================== START QUERY ==================='.red);
        logger.log(`Query: ${e.query}`);
        logger.log(`Params: ${e.params}`.italic.magenta);
        logger.log(`Duration: ${e.duration} ms`.blue);
        logger.log('====================== END QUERY ===================='.red);
      });
    } else {
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
