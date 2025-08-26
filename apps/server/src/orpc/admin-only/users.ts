import { member, user } from "@/db/schema";
import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminOnlyProcedure } from "../procedures";

export const usersRouter = {
	// Get all users in the current organization
	getOrganizationUsers: adminOnlyProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(100),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input, context }) => {
			const { limit, offset } = input;

			if (!context.organization) {
				throw new ORPCError("NOT_FOUND");
			}

			try {
				const organizationUsers = await context.db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						role: member.role,
						createdAt: user.createdAt,
						lastActiveAt: user.lastActiveAt,
					})
					.from(member)
					.innerJoin(user, eq(member.userId, user.id))
					.where(eq(member.organizationId, context.organization.id))
					.limit(limit)
					.offset(offset);

				// Transform to match the client User interface
				const transformedUsers = organizationUsers.map((orgUser) => ({
					id: orgUser.id,
					name: orgUser.name || "Unknown User",
					avatarUrl:
						orgUser.image ||
						`https://api.dicebear.com/9.x/glass/svg?seed=${orgUser.id}`,
					email: orgUser.email,
					status: "online" as const, // Default status, could be enhanced with real-time status
					role: (orgUser.role === "admin"
						? "Admin"
						: orgUser.role === "member"
							? "Member"
							: "Guest") as "Member" | "Admin" | "Guest",
					joinedDate: orgUser.createdAt.toISOString().split("T")[0],
					teamIds: [], // Could be enhanced to fetch actual team memberships
				}));

				return {
					users: transformedUsers,
					organizationId: context.organization.id,
					total: transformedUsers.length, // Could be enhanced with actual count query
				};
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Get a single user by ID
	getUserById: adminOnlyProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { userId } = input;

			if (!context.organization) {
				throw new ORPCError("NOT_FOUND");
			}

			try {
				const [orgUser] = await context.db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						role: member.role,
						createdAt: user.createdAt,
						lastActiveAt: user.lastActiveAt,
					})
					.from(member)
					.innerJoin(user, eq(member.userId, user.id))
					.where(
						eq(member.organizationId, context.organization.id) &&
							eq(user.id, userId),
					)
					.limit(1);

				if (!orgUser) {
					throw new ORPCError("NOT_FOUND");
				}

				// Transform to match the client User interface
				const transformedUser = {
					id: orgUser.id,
					name: orgUser.name || "Unknown User",
					avatarUrl:
						orgUser.image ||
						`https://api.dicebear.com/9.x/glass/svg?seed=${orgUser.id}`,
					email: orgUser.email,
					status: "online" as const, // Default status
					role: (orgUser.role === "admin"
						? "Admin"
						: orgUser.role === "member"
							? "Member"
							: "Guest") as "Member" | "Admin" | "Guest",
					joinedDate: orgUser.createdAt.toISOString().split("T")[0],
					teamIds: [], // Could be enhanced to fetch actual team memberships
				};

				return {
					user: transformedUser,
					organizationId: context.organization.id,
				};
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),
};
