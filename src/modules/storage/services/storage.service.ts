import {
  formatPathDocuments,
  getfrieldyNameFile,
} from '../utils/storage.utils';
import { ConfigService } from '@nestjs/config';

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CONTEXT } from '@nestjs/graphql';
import { File } from '@prisma/client';
import { FileNotFound, UserIdIsRequired } from 'src/errors/inputs.error';

import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  DownloadDocumentInput,
  GetDocumentsInput,
} from '../dto/document.input';
import {
  UpdateDocumentInput,
  UploadDocumentInput,
} from '../dto/upload-document.input';

import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  SASProtocol,
} from '@azure/storage-blob';
import * as dayjs from 'dayjs';

@Injectable({ scope: Scope.REQUEST })
export class StorageService {
  private allowOperation: boolean;
  private readonly logger = new Logger(StorageService.name);

  private storageClient: BlobServiceClient;
  private blobContainerDocuments: ContainerClient;

  constructor(
    @Inject(REQUEST) private request,
    @Inject(CONTEXT) private context,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.storageClient = BlobServiceClient.fromConnectionString(
      this.configService.get('AZURE_STORAGE_CONNECTION_STRING'),
    );

    this.blobContainerDocuments = this.storageClient.getContainerClient(
      this.configService.get('AZURE_DOCUMENTS_CONTAINER'),
    );

    this.allowOperation =
      this.request?.user?.isAdmin || this.context?.req?.user?.isAdmin;
  }

  async createDocument(
    infoDocument: UploadDocumentInput,
    file: Express.Multer.File,
    userId: string,
  ) {
    const userOwnId = this.allowOperation ? infoDocument.userId : userId;
    if (this.allowOperation && !infoDocument.userId) throw UserIdIsRequired;

    try {
      const fileCreated = await this.prisma.file.create({
        data: {
          name: file.originalname.split(/[.]/g)[0],
          mimeType: file.mimetype,
          userId: userOwnId,
          createdById: userId,
        },
      });

      await this.updateDocumentBlob(file, userOwnId, fileCreated.id);
      return fileCreated;
    } catch (e) {
      throw new BadRequestException(e, 'Failed in create document');
    }
  }

  async updateDocumentAndBlob(
    infoDocument: UpdateDocumentInput,
    file: Express.Multer.File,
    userId: string,
  ) {
    const userOwnId = this.allowOperation ? infoDocument.userId : userId;
    if (this.allowOperation && !infoDocument.userId) throw UserIdIsRequired;

    try {
      const fileUpdated = await this.prisma.file
        .update({
          where: {
            userId_id: {
              id: infoDocument.fileId,
              userId: userOwnId,
            },
          },
          data: {
            name: file.originalname.split(/[.]/g)[0],
            mimeType: file.mimetype,
            updatedById: userId,
          },
        })
        .catch(() => {
          throw FileNotFound;
        });

      await this.deleteDocumentBlob(userOwnId, fileUpdated.id);
      await this.updateDocumentBlob(file, userOwnId, fileUpdated.id);

      return fileUpdated;
    } catch (e) {
      throw new BadRequestException(e, 'Failed in update document');
    }
  }

  async deleteDocument(userId: string, fileId: string) {
    try {
      const fileDeleted = await this.prisma.file
        .delete({
          where: {
            userId_id: {
              userId,
              id: fileId,
            },
          },
        })
        .catch(() => {
          throw FileNotFound;
        });
      await this.deleteDocumentBlob(userId, fileId);
      return fileDeleted;
    } catch (e) {
      this.logger.error('Failed in remove document', e);
      throw new BadRequestException('Failed in remove document');
    }
  }

  async deleteDocumentBlob(userId: string, fileId: string) {
    const block = this.blobContainerDocuments.getBlockBlobClient(
      formatPathDocuments(userId, fileId),
    );

    await block.deleteIfExists();
  }

  private async updateDocumentBlob(
    file: Express.Multer.File,
    userId: string,
    fileId: string,
  ) {
    const block = this.blobContainerDocuments.getBlockBlobClient(
      formatPathDocuments(userId, fileId),
    );

    try {
      await block.upload(file.buffer, file.size);
    } catch (e) {
      this.logger.error('Failed in update document', e);
      throw new BadRequestException(e);
    }
  }

  async getFile(fileId: string): Promise<File> {
    return await this.prisma.file.findFirst({ where: { id: fileId } });
  }

  async blobExists(fileId: string): Promise<boolean> {
    const file = await this.getFile(fileId);
    const blob = this.blobContainerDocuments.getBlobClient(
      formatPathDocuments(file.userId, file.id),
    );
    return await blob.exists();
  }

  async listDocumentsUser(
    userId: string,
    getDocumentsInput: GetDocumentsInput,
  ) {
    if (this.allowOperation && !getDocumentsInput?.userId)
      throw UserIdIsRequired;

    return await this.prisma.file.findMany({
      where: {
        userId: this.allowOperation ? getDocumentsInput.userId : userId,
      },
    });
  }

  async downloadDocumentUser(userId: string, params: DownloadDocumentInput) {
    if (this.allowOperation && !params?.userId) throw UserIdIsRequired;
    userId = this.allowOperation ? params.userId : userId;

    try {
      const block = this.blobContainerDocuments.getBlockBlobClient(
        `${userId}/${params.documentId}`,
      );
      if (!(await block.exists())) throw FileNotFound;

      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const file = await this.prisma.file.findFirst({
        where: { id: params.documentId },
      });
      const frieldyNameFile = getfrieldyNameFile(file);

      const linkSAS = await block.generateSasUrl({
        permissions,
        protocol: SASProtocol.Https,
        startsOn: dayjs().toDate(),
        expiresOn: dayjs().add(1, 'day').toDate(),
        contentDisposition: 'attachment; filename="' + frieldyNameFile,
      });
      return linkSAS;
    } catch (e) {
      this.logger.error('Failed in download document', e);
      throw new BadRequestException('Failed in download document');
    }
  }
}
