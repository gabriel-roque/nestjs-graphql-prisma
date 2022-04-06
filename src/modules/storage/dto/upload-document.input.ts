import { Field } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

export class UploadDocumentInput {
  @Field({ nullable: true })
  userId?: string;
}

export class UpdateDocumentInput extends UploadDocumentInput {
  @Field({ nullable: false })
  @IsUUID('4')
  fileId: string;
}
