import config from './configs/config';
import { GraphqlConfig, ThrottlerConfig } from './configs/config.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';
import { UserModule } from './modules/user/user.module';

import { UserMiddleware } from './middlewares/user.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const throttlerConfig = configService.get<ThrottlerConfig>('throttler');
        return {
          ttl: throttlerConfig.ttl,
          limit: throttlerConfig.limit,
        };
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const graphqlConfig = configService.get<GraphqlConfig>('graphql');
        return {
          sortSchema: graphqlConfig.sortSchema,
          autoSchemaFile: './src/schema.graphql',
          installSubscriptionHandlers: true,
          buildSchemaOptions: {
            numberScalarMode: 'integer',
          },
          debug: graphqlConfig.debug,
          playground: graphqlConfig.playgroundEnabled,
          context: ({ req }) => ({ req }),
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    HealthModule,
    UserModule,
    AuthModule,
    EmailModule,
    StorageModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
