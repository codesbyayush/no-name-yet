import { os, ORPCError } from "@orpc/server";
import type { Context, AdminContext } from "./context";

export const o = os.$context<Context>();
export const adminO = os.$context<AdminContext>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: context,
  });
});

const requireOrganization = o.middleware(async ({ context, next }) => {
  if (!context.organization) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context,
  });
});

const requireAdminAuth = adminO.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  if (!context.organization) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context,
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const organizationProcedure = publicProcedure.use(requireOrganization);

export const adminOnlyProcedure = adminO.use(requireAdminAuth);
