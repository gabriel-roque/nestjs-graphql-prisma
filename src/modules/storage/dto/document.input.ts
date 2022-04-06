import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@InputType()
export class GetDocumentsInput {
  @Field({ nullable: true })
  userId: string;
}

@InputType()
export class DownloadDocumentInput {
  @Field({ nullable: false })
  @IsUUID()
  userId: string;

  @Field({ nullable: false })
  @IsUUID()
  documentId: string;
}

@InputType()
export class DeleteDocumentInput extends DownloadDocumentInput {}

@InputType()
export class UpdateStatusDocumentInput extends DownloadDocumentInput {}
