import config from 'src/configs/config';
import { bytesToMega } from 'src/utils/file.util';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { MimeTypesNames } from 'src/modules/storage/enums/mime-types.enum';

export const UserIdIsRequired = new BadRequestException(
  '`userId` is required.',
);

export const FormatFileNotValid = new BadRequestException(
  `Format is not valid, formats valids: ${MimeTypesNames.map(
    (mime) => mime,
  ).join(', ')}`,
);

export const SizeFileIsLarge = new BadRequestException(
  `File exceeds limit. Limit: ${bytesToMega(
    Number(config().storage.maxSize),
  )} MB`,
);

export const EmailConflict = new ConflictException('Email already exists.');
export const UserNotFound = new NotFoundException('User not found.');
export const FileNotFound = new NotFoundException('File not found.');
export const InvalidToken = new UnauthorizedException('Token invalid.');
