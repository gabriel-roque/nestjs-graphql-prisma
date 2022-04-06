export enum TypeTemplates {
  confirmEmail = 'confirm',
  resetPassword = 'reset-password',
  ptc = 'ptc',
  linkAccess = 'link-access',
  registrationDocuments = 'update-user',
}

export const emailTemplates = {
  confirmEmail: {
    subject: 'Domain Company - Email confirmation',
    template: TypeTemplates.confirmEmail,
  },
  resetPassword: {
    subject: 'Domain Company - Reset password',
    template: TypeTemplates.resetPassword,
  },
  linkAccess: {
    subject: 'Domain Company - Login Access',
    template: TypeTemplates.linkAccess,
  },
};
