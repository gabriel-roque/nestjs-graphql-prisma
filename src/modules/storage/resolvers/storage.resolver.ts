import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { StorageService } from '../services/storage.service';
import { Roles } from 'src/modules/auth/decorators/role.decorator';
import { Role } from 'src/modules/auth/enum/role.enum';
import { GqlAuthGuard } from 'src/modules/auth/guards/gql-auth.guard';
import { File } from 'src/modules/storage/entities/file.entity';
import { UserDecorator } from 'src/modules/user/decorators/user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

import {
  DeleteDocumentInput,
  DownloadDocumentInput,
  GetDocumentsInput,
} from '../dto/document.input';

@Resolver(() => File)
export class StorageResolver {
  constructor(
    private readonly storageService: StorageService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [File])
  @Roles(Role.Admin, Role.User)
  async listDocumentsUser(
    @UserDecorator() user: User,
    @Args('data', { nullable: true }) getDocumentsInput: GetDocumentsInput,
  ) {
    return await this.storageService.listDocumentsUser(
      user.id,
      getDocumentsInput,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String)
  @Roles(Role.Admin, Role.User)
  async downloadDocument(
    @UserDecorator() user: User,
    @Args('data') params: DownloadDocumentInput,
  ) {
    return await this.storageService.downloadDocumentUser(user.id, params);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => File)
  @Roles(Role.Admin)
  async deleteDocument(@Args('data') params: DeleteDocumentInput) {
    return await this.storageService.deleteDocument(
      params.userId,
      params.documentId,
    );
  }

  @ResolveField(() => User)
  @Roles(Role.Admin, Role.User)
  async user(@Parent() file: File) {
    return await this.userService.getUser(file.userId);
  }

  @ResolveField(() => User)
  @Roles(Role.Admin, Role.User)
  async createdBy(@Parent() file: File) {
    return await this.userService.getUser(file.createdById);
  }

  @ResolveField(() => User)
  @Roles(Role.Admin, Role.User)
  async updatedBy(@Parent() file: File) {
    return file.updatedById
      ? await this.userService.getUser(file.updatedById)
      : null;
  }
}
