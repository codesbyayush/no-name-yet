import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronUpDown,
	Clock,
	Info,
	Lightbulb,
	PlusIcon,
	Settings,
	X,
} from "lucide-react";
import { useState } from "react";

interface Status {
	id: string;
	name: string;
	color: string;
	category: string;
	isDefault?: boolean;
}

interface StatusCategory {
	id: string;
	name: string;
	statuses: Status[];
}

interface FeedbackBoard {
	id: string;
	name: string;
	icon: string;
}

export function FeedbackSettings() {
	const [statusCategories, setStatusCategories] = useState<StatusCategory[]>([
		{
			id: "reviewing",
			name: "Reviewing",
			statuses: [
				{
					id: "in-review",
					name: "In Review",
					color: "bg-blue-500",
					category: "reviewing",
					isDefault: true,
				},
			],
		},
		{
			id: "planned",
			name: "Planned",
			statuses: [
				{
					id: "planned",
					name: "Planned",
					color: "bg-purple-500",
					category: "planned",
				},
			],
		},
		{
			id: "active",
			name: "Active",
			statuses: [
				{
					id: "in-progress",
					name: "In Progress",
					color: "bg-blue-500",
					category: "active",
				},
			],
		},
		{
			id: "completed",
			name: "Completed",
			statuses: [
				{
					id: "completed",
					name: "Completed",
					color: "bg-green-500",
					category: "completed",
				},
			],
		},
		{
			id: "canceled",
			name: "Canceled",
			statuses: [
				{
					id: "rejected",
					name: "Rejected",
					color: "bg-red-500",
					category: "canceled",
				},
			],
		},
	]);

	const [hideCompletedCanceled, setHideCompletedCanceled] = useState(false);
	const [hideAllStatuses, setHideAllStatuses] = useState(false);

	const [feedbackBoards, setFeedbackBoards] = useState<FeedbackBoard[]>([
		{
			id: "feature-request",
			name: "Feature Request",
			icon: "lightbulb",
		},
	]);

	const [defaultSorting, setDefaultSorting] = useState("recent-posts");

	// Empty handlers for future backend integration
	const handleAddStatus = (categoryId: string) => {
		console.log("Add status to category:", categoryId);
		// TODO: Implement backend integration
	};

	const handleEditStatus = (statusId: string) => {
		console.log("Edit status:", statusId);
		// TODO: Implement backend integration
	};

	const handleDeleteStatus = (statusId: string) => {
		console.log("Delete status:", statusId);
		// TODO: Implement backend integration
	};

	const handleHideCompletedCanceledChange = (checked: boolean) => {
		setHideCompletedCanceled(checked);
		// TODO: Implement backend integration
	};

	const handleHideAllStatusesChange = (checked: boolean) => {
		setHideAllStatuses(checked);
		// TODO: Implement backend integration
	};

	// Feedback module handlers
	const handleAddBoard = () => {
		console.log("Add new feedback board");
		// TODO: Implement backend integration
	};

	const handleEditBoard = (boardId: string) => {
		console.log("Edit board:", boardId);
		// TODO: Implement backend integration
	};

	const handleDeleteBoard = (boardId: string) => {
		console.log("Delete board:", boardId);
		// TODO: Implement backend integration
	};

	const handleBoardInfo = (boardId: string) => {
		console.log("Show board info:", boardId);
		// TODO: Implement backend integration
	};

	const handleDefaultSortingChange = (value: string) => {
		setDefaultSorting(value);
		// TODO: Implement backend integration
	};

	return (
		<div className="space-y-8">
			{/* Feedback Module Section */}
			<Card className="border border-muted-foreground/10 bg-card">
				<CardHeader>
					<CardTitle>Feedback module</CardTitle>
					<CardDescription>
						Reorder, customize or remove links (modules) from being displayed
						from public portal or widgets.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div />
						<Button onClick={handleAddBoard} className="bg-primary">
							<PlusIcon className="mr-2 h-4 w-4" />
							Add board
						</Button>
					</div>

					<div className="space-y-3">
						{feedbackBoards.map((board) => (
							<div
								key={board.id}
								className="flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/20 p-4"
							>
								<div className="flex items-center space-x-3">
									<Lightbulb className="h-5 w-5 text-yellow-500" />
									<span className="font-medium">{board.name}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleBoardInfo(board.id)}
										className="h-8 w-8 p-0"
									>
										<Info className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleEditBoard(board.id)}
										className="h-8 px-3"
									>
										<Settings className="mr-2 h-4 w-4" />
										Edit
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDeleteBoard(board.id)}
										className="h-8 px-3 text-destructive hover:text-destructive"
									>
										<X className="mr-2 h-4 w-4" />
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>

					<div className="space-y-3">
						<Label className="font-medium">Default sorting</Label>
						<Select
							value={defaultSorting}
							onValueChange={handleDefaultSortingChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="recent-posts">
									<div className="flex items-center space-x-2">
										<Clock className="h-4 w-4" />
										<span>Recent posts</span>
									</div>
								</SelectItem>
								<SelectItem value="most-voted">
									<div className="flex items-center space-x-2">
										<Clock className="h-4 w-4" />
										<span>Most voted</span>
									</div>
								</SelectItem>
								<SelectItem value="oldest-first">
									<div className="flex items-center space-x-2">
										<Clock className="h-4 w-4" />
										<span>Oldest first</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Statuses Section */}
			<Card className="border border-muted-foreground/10 bg-card">
				<CardHeader>
					<CardTitle>Statuses</CardTitle>
					<CardDescription>
						Customize existing ones or add extra statuses you can add for posts.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{statusCategories.map((category) => (
						<div key={category.id} className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg">{category.name}</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleAddStatus(category.id)}
									className="h-8 px-3"
								>
									<PlusIcon className="h-4 w-4" />
								</Button>
							</div>
							<div className="space-y-2">
								{category.statuses.map((status) => (
									<div
										key={status.id}
										className="flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/20 p-3"
									>
										<div className="flex items-center space-x-3">
											<div className={`h-3 w-3 rounded-full ${status.color}`} />
											<span className="font-medium">{status.name}</span>
											{status.isDefault && (
												<Badge variant="secondary" className="text-xs">
													Default
												</Badge>
											)}
										</div>
										<div className="flex items-center space-x-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditStatus(status.id)}
												className="h-8 w-8 p-0"
											>
												<Settings className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteStatus(status.id)}
												className="h-8 w-8 p-0 text-destructive hover:text-destructive"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Hiding Options Section */}
			<Card className="border border-muted-foreground/10 bg-card">
				<CardHeader>
					<CardTitle>Hiding Options</CardTitle>
					<CardDescription>
						Configure visibility settings for your feedback board.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-start space-x-3">
						<Checkbox
							id="hide-completed-canceled"
							checked={hideCompletedCanceled}
							onCheckedChange={handleHideCompletedCanceledChange}
						/>
						<div className="space-y-1">
							<Label
								htmlFor="hide-completed-canceled"
								className="font-medium text-sm"
							>
								Hide completed and canceled posts from feedback board
							</Label>
							<p className="text-muted-foreground text-sm">
								By default completed and canceled posts are shown on the
								feedback board. You can hide them to keep your feedback board
								clean.
							</p>
						</div>
					</div>

					<div className="flex items-start space-x-3">
						<Checkbox
							id="hide-all-statuses"
							checked={hideAllStatuses}
							onCheckedChange={handleHideAllStatusesChange}
						/>
						<div className="space-y-1">
							<Label
								htmlFor="hide-all-statuses"
								className="font-medium text-sm"
							>
								Hide all statuses from public feedback board
							</Label>
							<p className="text-muted-foreground text-sm">
								By default users will be able to see statuses of posts on the
								feedback board. Check this option to hide all statuses from the
								public feedback board.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
