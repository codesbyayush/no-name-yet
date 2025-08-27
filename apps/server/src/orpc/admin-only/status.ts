import { statuses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { adminOnlyProcedure } from "../procedures";

export const statusRouter = adminOnlyProcedure.router({
	getAll: adminOnlyProcedure.handler(async ({ input, context }) => {
		const allStatuses = await context.db
			.select()
			.from(statuses)
			.where(eq(statuses.organizationId, context.organization.id));
		return allStatuses;
	}),

	getById: adminOnlyProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const status = await context.db
				.select()
				.from(statuses)
				.where(
					and(
						eq(statuses.id, input.id),
						eq(statuses.organizationId, context.organization.id),
					),
				);
			return status[0];
		}),

	create: adminOnlyProcedure
		.input(
			z.object({
				name: z.string(),
				color: z.string(),
				key: z.string(),
				isTerminal: z.boolean(),
			}),
		)
		.handler(async ({ input, context }) => {
			const status = await context.db.insert(statuses).values({
				name: input.name,
				color: input.color,
				organizationId: context.organization.id,
				key: input.key,
				isTerminal: input.isTerminal,
			});
			return status;
		}),

	update: adminOnlyProcedure
		.input(z.object({ id: z.string(), name: z.string(), color: z.string() }))
		.handler(async ({ input, context }) => {
			const status = await context.db
				.update(statuses)
				.set({
					name: input.name,
					color: input.color,
				})
				.where(
					and(
						eq(statuses.id, input.id),
						eq(statuses.organizationId, context.organization.id),
					),
				);
			return status;
		}),

	delete: adminOnlyProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const status = await context.db
				.delete(statuses)
				.where(eq(statuses.id, input.id));
			return status;
		}),
});
