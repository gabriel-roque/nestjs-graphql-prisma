import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (data === 'http') return ctx.switchToHttp().getRequest().user;
    return GqlExecutionContext.create(ctx).getContext().req.user;
  },
);
