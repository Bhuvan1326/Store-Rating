import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Injects the authenticated user from the request — set by JwtStrategy.validate()
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
