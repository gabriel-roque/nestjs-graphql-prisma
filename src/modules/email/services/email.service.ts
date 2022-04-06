import { ConfigService } from '@nestjs/config';
import { SmtpConfig } from 'src/configs/config.interface';

import { Injectable, Logger } from '@nestjs/common';

import { emailTemplates } from '../enum/templates.enum';

import {
  EmailConfirmationData,
  EmailLinkAccessData,
  EmailProvider,
  EmailResetPasswordData,
  ParamsEmailSend,
} from '../interfaces/email.interfaces';

import { MailService } from '@sendgrid/mail';
import * as fs from 'fs';
import Handlebars from 'handlebars';

@Injectable()
export class EmailService implements EmailProvider {
  private client = new MailService();
  private smtpConfig: SmtpConfig;
  private readonly logger: Logger;
  private readonly domain: string;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(EmailService.name);
    this.smtpConfig = configService.get<SmtpConfig>('email');
    this.client.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    this.registerPartials();
    this.domain = process.env.DOMAIN;
  }

  async sendEmailConfirmation(data: EmailConfirmationData): Promise<void> {
    await this.sendEmail({
      to: data.email,
      template: emailTemplates.confirmEmail.template,
      subject: emailTemplates.confirmEmail.subject,
      data: {
        name: data.name,
        link: `${this.domain}/confirm?token=${data.emailToken}`,
      },
    });
    this.logger.log(
      `Email do tipo [${emailTemplates.confirmEmail.template}] enviado para ${data.email}`,
    );
  }

  async sendEmailResetPassword(data: EmailResetPasswordData): Promise<void> {
    await this.sendEmail({
      to: data.email,
      template: emailTemplates.resetPassword.template,
      subject: emailTemplates.resetPassword.subject,
      data: {
        name: data.name,
        link: `${this.domain}/reset-password?token=${data.passwordToken}`,
      },
    });
    this.logger.log(
      `Email do tipo [${emailTemplates.resetPassword.template}] enviado para ${data.email}`,
    );
  }

  async sendEmailLinkAccess(data: EmailLinkAccessData): Promise<void> {
    await this.sendEmail({
      to: data.email,
      template: emailTemplates.linkAccess.template,
      subject: emailTemplates.linkAccess.subject,
      data: {
        name: data.name,
        link: `${this.domain}/login?token=${data.token}`,
      },
    });
    this.logger.log(
      `Email do tipo [${emailTemplates.linkAccess.template}] enviado para ${data.email}`,
    );
  }

  async sendEmail(params: ParamsEmailSend): Promise<string | void> {
    try {
      const HTML_RENDERED = this.buildEmail(params);

      if (this.configService.get('SMTP_PROVIDER') === 'sendgrid') {
        await this.client.send({
          ...this.smtpConfig,
          to: params.to,
          subject: params.subject,
          html: HTML_RENDERED,
        });
      }
      if (this.configService.get('NODE_ENV') === 'development')
        return this.saveEmail(params.to, HTML_RENDERED);
    } catch (e) {
      this.logger.error(`Falha em enviar email: ${params.to}`, e);
    }
  }

  /* istanbul ignore next */
  private registerPartials() {
    const PARTIALS_DIR = `${__dirname}/../templates/partials`;
    const files = fs.readdirSync(PARTIALS_DIR);

    files.forEach((file: string) => {
      const name = file.split(/[.]/g)[0];
      const partial = fs
        .readFileSync(`${PARTIALS_DIR}/${name}.hbs`)
        .toString('utf8');
      Handlebars.registerPartial(name, partial);
    });
  }

  /* istanbul ignore next */
  private buildEmail(params: ParamsEmailSend): string {
    const templateFile = this.loadTemplate(params.template);

    const view = Handlebars.compile(templateFile, { noEscape: true });
    return view({ ...params.data, currentYear: new Date().getFullYear() });
  }

  /* istanbul ignore next */
  private loadTemplate(template: string): string {
    return fs
      .readFileSync(`${__dirname}/../templates/${template}.hbs`)
      .toString('utf8');
  }

  /* istanbul ignore next */
  private saveEmail(email: string, html: string): string {
    if (!fs.existsSync('email-sends/')) fs.mkdirSync('email-sends/');
    const random = Math.floor((10 - 1) * Math.random());
    const pathFile = `email-sends/${email}-${new Date()}-${random}.html`
      .split(/[ ]/g)
      .join('-');
    fs.writeFileSync(pathFile, html);
    return pathFile;
  }
}
