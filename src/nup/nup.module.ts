import { Module } from '@nestjs/common';
import { NupResolver } from './nup.resolver';

@Module({
  providers: [NupResolver],
})
export class NupModule {}
