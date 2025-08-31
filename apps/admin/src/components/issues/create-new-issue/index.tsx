import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Issue } from "@/mock-data/issues";
import { ranks } from "@/mock-data/issues";
import { priorities } from "@/mock-data/priorities";
import { type Status, status } from "@/mock-data/status";
import { useAddIssue, useIssues } from "@/react-db/issues";
import { useCreateIssueStore } from "@/store/create-issue-store";
import { DialogTitle } from "@radix-ui/react-dialog";
import { RiEditLine } from "@remixicon/react";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { AssigneeSelector } from "./assignee-selector";
import { LabelSelector } from "./label-selector";
import { PrioritySelector } from "./priority-selector";
import { StatusSelector } from "./status-selector";

export function CreateNewIssue() {
	const [createMore, setCreateMore] = useState<boolean>(false);
	const { isOpen, defaultStatusKey, openModal, closeModal } =
		useCreateIssueStore();
	const { data: issues } = useIssues();
	const addIssue = useAddIssue();

	const generateUniqueIdentifier = () => {
		const identifiers = (issues ?? []).map((issue) => issue.identifier);
		let identifier = Math.floor(Math.random() * 999)
			.toString()
			.padStart(3, "0");
		while (identifiers.includes(`LNUI-${identifier}`)) {
			identifier = Math.floor(Math.random() * 999)
				.toString()
				.padStart(3, "0");
		}
		return identifier;
	};

	const createDefaultData = useCallback(() => {
		const identifier = generateUniqueIdentifier();
		return {
			id: uuidv4(),
			identifier: `LNUI-${identifier}`,
			issueKey: `LNUI-${identifier}`,
			title: "",
			description: "",
			status:
				status.find((s) => s.key === defaultStatusKey) ||
				status.find((s) => s.key === "to-do")!,
			statusKey: defaultStatusKey,
			assigneeId: undefined,
			assignee: null,
			priority: priorities.find((p) => p.id === "no-priority")!,
			priorityKey: "no-priority",
			labels: [],
			createdAt: new Date().toISOString(),
			cycleId: "",
			project: undefined,
			subissues: [],
			rank: ranks[ranks.length - 1],
			tags: [],
		};
	}, [defaultStatusKey]);

	const [addIssueForm, setAddIssueForm] = useState<Issue>(createDefaultData());

	useEffect(() => {
		if (isOpen) {
			setAddIssueForm(createDefaultData());
		}
	}, [isOpen, createDefaultData]);

	const createIssue = () => {
		if (!addIssueForm.title) {
			toast.error("Title is required");
			return;
		} else if (!addIssueForm.description) {
			toast.error("Description is required");
			return;
		}
		addIssue.mutate(addIssueForm);
		toast.success("Issue created");
		if (!createMore) {
			closeModal();
		}
		setAddIssueForm(createDefaultData());
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(value) => (value ? openModal() : closeModal())}
		>
			<DialogTrigger asChild>
				<Button className="size-8 shrink-0" variant="secondary" size="icon">
					<RiEditLine />
				</Button>
			</DialogTrigger>
			<DialogContent className="top-[30%] w-full p-0 shadow-xl sm:max-w-[750px]">
				<DialogHeader>
					<DialogTitle>
						<div className="flex items-center gap-2 px-4 pt-4">
							<Button size="sm" variant="outline" className="gap-1.5">
								<Heart className="size-4 fill-orange-500 text-orange-500" />
								<span className="font-medium capitalize">new issue</span>
							</Button>
						</div>
					</DialogTitle>
				</DialogHeader>

				<div className="w-full space-y-3 px-4 pb-0">
					<Input
						className="h-auto w-full overflow-hidden text-ellipsis whitespace-normal break-words border-none px-0 font-medium text-2xl shadow-none outline-none focus-visible:ring-0"
						placeholder="Issue title"
						value={addIssueForm.title}
						onChange={(e) =>
							setAddIssueForm({ ...addIssueForm, title: e.target.value })
						}
					/>

					<Textarea
						className="overflow-wrap min-h-16 w-full resize-none whitespace-normal break-words border-none px-0 shadow-none outline-none focus-visible:ring-0"
						placeholder="Add description..."
						value={addIssueForm.description}
						onChange={(e) =>
							setAddIssueForm({ ...addIssueForm, description: e.target.value })
						}
					/>

					<div className="flex w-full flex-wrap items-center justify-start gap-1.5">
						<StatusSelector
							statusKey={addIssueForm.statusKey || "to-do"}
							onChange={(newStatus) =>
								setAddIssueForm({ ...addIssueForm, statusKey: newStatus })
							}
						/>
						<PrioritySelector
							priorityKey={addIssueForm.priorityKey || "no-priority"}
							onChange={(newPriority) =>
								setAddIssueForm({ ...addIssueForm, priorityKey: newPriority })
							}
						/>
						<AssigneeSelector
							assigneeId={addIssueForm.assigneeId || undefined}
							onChange={(newAssignee) =>
								setAddIssueForm({ ...addIssueForm, assigneeId: newAssignee })
							}
						/>
						{/* <ProjectSelector
						project={addIssueForm.project}
						onChange={(newProject) =>
							setAddIssueForm({ ...addIssueForm, project: newProject })
						}
						/> */}
						<LabelSelector
							selectedLabels={addIssueForm.labels}
							onChange={(newLabels) =>
								setAddIssueForm({ ...addIssueForm, labels: newLabels })
							}
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-between border-t px-4 py-2.5">
					<div className="flex items-center gap-2">
						<div className="flex items-center space-x-2">
							<Switch
								id="create-more"
								checked={createMore}
								onCheckedChange={setCreateMore}
							/>
							<Label htmlFor="create-more">Create more</Label>
						</div>
					</div>
					<Button
						size="sm"
						onClick={() => {
							createIssue();
						}}
					>
						Create issue
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
