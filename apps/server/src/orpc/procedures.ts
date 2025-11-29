import { ORPCError, os } from '@orpc/server';
import type { AdminContext, Context } from './context';

export const o = os.$context<Context>();
export const adminO = os.$context<AdminContext>();

// Global error boundary middleware
const withErrorBoundary = o.middleware(async ({ context, next }) => {
  try {
    return await next({ context });
  } catch (error) {
    // If already an ORPCError, rethrow
    if (error instanceof ORPCError) {
      throw error;
    }
    // Minimal structured logging
    context.logger.error('Unhandled error in ORPC handler', {
      scope: 'orpc',
      context: {
        userId: context.session?.user?.id,
        orgId: context.session?.session?.activeOrganizationId,
        teamId: context.team?.id,
      },
      error,
    });
    throw new ORPCError('INTERNAL_SERVER_ERROR');
  }
});

export const publicProcedure = o.use(withErrorBoundary);

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED');
  }
  return next({
    context,
  });
});

const requireTeam = o.middleware(({ context, next }) => {
  if (!context.team) {
    throw new ORPCError('UNAUTHORIZED');
  }
  return next({
    context,
  });
});

const requireAdminAuth = adminO.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED');
  }

  if (!context.team) {
    throw new ORPCError('UNAUTHORIZED');
  }
  return next({
    context,
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const teamProcedure = publicProcedure.use(requireTeam);

export const adminOnlyProcedure = adminO.use(requireAdminAuth);
