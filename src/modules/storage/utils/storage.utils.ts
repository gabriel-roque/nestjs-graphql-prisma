import { File } from '@prisma/client';

export const getfrieldyNameFile = (file: File) =>
  `${file.name}.${file.mimeType.split(/[/]/g)[1]}`;

export const formatPathDocuments = (userId: string, fileId: string) =>
  `${userId}/${fileId}`;
