import { TypeTemplates } from '../enum/templates.enum';

export interface ParamsEmailSend {
  to: string;
  template: TypeTemplates;
  subject: string;
  data?: any;
}

export interface EmailConfirmationData {
  name: string;
  email: string;
  emailToken: string;
}

export interface EmailResetPasswordData {
  name: string;
  email: string;
  passwordToken: string;
}

export interface EmailLinkAccessData {
  name: string;
  email: string;
  token: string;
}

export interface EmailProvider {
  sendEmailConfirmation(data: EmailConfirmationData): Promise<void>;
  sendEmailResetPassword(data: EmailResetPasswordData): Promise<void>;
  sendEmailLinkAccess(params: EmailLinkAccessData): Promise<void>;
  sendEmail(params: ParamsEmailSend): Promise<void | string>;
}
