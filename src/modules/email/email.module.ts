import { Module } from '@nestjs/common';

import { EmailService } from './services/email.service';

import { EmailController } from './email.controller';

@Module({
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
