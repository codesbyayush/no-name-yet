import { LexoRank } from "@/lib/utils";
import { type LabelInterface, labels } from "./labels";
import { type Priority, priorities } from "./priorities";
import { type Project, projects } from "./projects";
import { type Status, status } from "./status";
import { type User, users } from "./users";

export interface Issue {
	id: string;
	issueKey: string;
	identifier: string;
	title: string;
	description: string;
	status: Status;
	statusKey?: string;
	priorityKey?: string;
	assignee: User | null;
	assigneeId?: string;
	priority: Priority;
	tags: LabelInterface[];
	createdAt: string;
	cycleId: string;
	project?: Project;
	subissues?: string[];
	rank: string;
	dueDate?: string;
}

// generates issues ranks using LexoRank algorithm.
export const ranks: string[] = [];
const generateIssuesRanks = () => {
	const firstRank = new LexoRank("a3c");
	ranks.push(firstRank.toString());
	for (let i = 1; i < 30; i++) {
		const previousRank = LexoRank.from(ranks[i - 1]);
		const currentRank = previousRank.increment();
		ranks.push(currentRank.toString());
	}
};
generateIssuesRanks();

export function groupIssuesByStatus(issues: Issue[]): Record<string, Issue[]> {
	return issues.reduce<Record<string, Issue[]>>((acc, issue) => {
		const statusId = issue.status.id;

		if (!acc[statusId]) {
			acc[statusId] = [];
		}

		acc[statusId].push(issue);

		return acc;
	}, {});
}

export function sortIssuesByPriority(issues: Issue[]): Issue[] {
	const priorityOrder: Record<string, number> = {
		urgent: 0,
		high: 1,
		medium: 2,
		low: 3,
		"no-priority": 4,
	};

	return issues
		.slice()
		.sort(
			(a, b) =>
				priorityOrder[a.priorityKey as keyof typeof priorityOrder] -
				priorityOrder[b.priorityKey as keyof typeof priorityOrder],
		);
}
