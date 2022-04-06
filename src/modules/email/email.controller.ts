import { ConfigService } from '@nestjs/config';

import { Body, Controller, Post } from '@nestjs/common';

import { EmailService } from './services/email.service';

import { ParamsEmailSend } from './interfaces/email.interfaces';

import * as open from 'open';
import * as path from 'path';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Post('test')
  async test(@Body() data: ParamsEmailSend): Promise<string> {
    if (this.configService.get('NODE_ENV') === 'development') {
      const pathfile = await this.emailService.sendEmail({ ...data });
      if (pathfile) await open(path.resolve(pathfile), { wait: false });
    }

    return 'Email Send!';
  }
}
