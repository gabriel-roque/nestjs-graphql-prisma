export enum MimeTypes {
  jpeg = 'image/jpeg',
  png = 'image/png',
  pdf = 'application/pdf',
}

export const MimeTypesNames: Array<string> = Object.keys(MimeTypes).map(
  (key) => MimeTypes[key],
);
