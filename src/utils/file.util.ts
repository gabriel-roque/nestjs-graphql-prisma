import config from 'src/configs/config';

import { MimeTypesNames } from 'src/modules/storage/enums/mime-types.enum';

export const formatIsValid = (mimeType: string) =>
  MimeTypesNames.includes(mimeType);

export const fileIsLarge = (size: number) =>
  size <= Number(config().storage.maxSize);

export const bytesToMega = (size: number) => size / (1024 * 1024);
