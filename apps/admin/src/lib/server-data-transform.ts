import { LexoRank } from "@/lib/utils";
import type { Issue } from "@/mock-data/issues";
import { labels } from "@/mock-data/labels";
import { priorities } from "@/mock-data/priorities";
import { projects } from "@/mock-data/projects";
import { status } from "@/mock-data/status";
import { users } from "@/mock-data/users";

// Generate ranks for issues
const generateRank = (index: number) => {
	const firstRank = new LexoRank("a3c");
	for (let i = 0; i < index; i++) {
		const previousRank = LexoRank.from(firstRank.toString());
		firstRank.increment();
	}
	return firstRank.toString();
};

// Map server priority to client priority
const mapServerPriorityToClient = (serverPriority: string) => {
	const priorityMap: Record<string, string> = {
		low: "low",
		medium: "medium",
		high: "high",
		urgent: "urgent",
		no_priority: "no-priority",
	};

	const priorityId = priorityMap[serverPriority] || "no-priority";
	return priorities.find((p) => p.id === priorityId) || priorities[4]; // Default to no-priority
};

// Map server status to client status
const mapServerStatusToClient = (serverStatusKey: string) => {
	const statusMap: Record<string, string> = {
		"to-do": "to-do",
		"in-progress": "in-progress",
		"technical-review": "technical-review",
		completed: "completed",
		paused: "paused",
		backlog: "backlog",
	};

	const statusId = statusMap[serverStatusKey] || "to-do";
	return status.find((s) => s.id === statusId) || status[5]; // Default to to-do
};

// Transform server post data to client Issue format
export const transformServerPostToIssue = (
	serverPost: any,
	index: number,
): Issue => {
	// Map server data to client format
	const clientIssue: Issue = {
		id: serverPost.id,
		identifier: serverPost.issueKey || `ISSUE-${serverPost.id.slice(0, 8)}`,
		title: serverPost.title || "Untitled Issue",
		description: serverPost.description || "",
		status: mapServerStatusToClient(serverPost.statusKey),
		assignee: serverPost.assigneeId
			? {
					id: serverPost.assigneeId,
					name: serverPost.assigneeName || "Unknown User",
					email: serverPost.assigneeEmail || "unknown@example.com",
					image: serverPost.assigneeImage || "",
				}
			: null,
		priority: mapServerPriorityToClient(serverPost.priority),
		labels: serverPost.tags?.map((tag: any) => ({
			id: tag.id,
			name: tag.name,
			color: tag.color,
		})) || [labels[0]], // Default to first label
		createdAt: serverPost.createdAt
			? new Date(serverPost.createdAt).toISOString().split("T")[0]
			: "2025-01-01",
		cycleId: "42", // Mock cycle ID
		project: projects[index % projects.length], // Rotate through projects
		rank: generateRank(index),
		dueDate: serverPost.dueDate
			? new Date(serverPost.dueDate).toISOString().split("T")[0]
			: undefined,
	};

	return clientIssue;
};

// Transform multiple server posts to client issues
export const transformServerPostsToIssues = (serverPosts: any[]): Issue[] => {
	return serverPosts.map((post, index) =>
		transformServerPostToIssue(post, index),
	);
};
