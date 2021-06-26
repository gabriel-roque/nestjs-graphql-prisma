import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { NupModule } from './nup/nup.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
    }),
    NupModule,
  ],
})
export class AppModule {}
