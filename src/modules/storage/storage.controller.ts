import { fileIsLarge, formatIsValid } from 'src/utils/file.util';

import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormatFileNotValid, SizeFileIsLarge } from 'src/errors/inputs.error';

import { StorageService } from './services/storage.service';
import { Role } from 'src/modules/auth/enum/role.enum';

import { Roles } from '../auth/decorators/role.decorator';
import { UserDecorator } from '../user/decorators/user.decorator';

import { User } from '../user/entities/user.entity';
import {
  UpdateDocumentInput,
  UploadDocumentInput,
} from './dto/upload-document.input';

@Controller('upload')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.Admin, Role.User)
  async uploadDocument(
    @UserDecorator('http') user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() infoDocument: UploadDocumentInput,
  ) {
    if (!formatIsValid(file.mimetype)) throw FormatFileNotValid;
    if (!fileIsLarge(file.size)) throw SizeFileIsLarge;

    return await this.storageService.createDocument(
      infoDocument,
      file,
      user.id,
    );
  }

  @Put('documents')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.Admin, Role.User)
  async updateDocument(
    @UserDecorator('http') user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() infoDocument: UpdateDocumentInput,
  ) {
    if (!formatIsValid(file.mimetype)) throw FormatFileNotValid;
    if (!fileIsLarge(file.size)) throw SizeFileIsLarge;

    return await this.storageService.updateDocumentAndBlob(
      infoDocument,
      file,
      user.id,
    );
  }
}
