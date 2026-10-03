import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AnonymousSession } from './session.guard';

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AnonymousSession => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);
