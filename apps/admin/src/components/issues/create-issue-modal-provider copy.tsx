import { CreateNewIssue } from "@/components/issues/create-new-issue";

export function CreateIssueModalProvider() {
	return (
		<div className="hidden">
			<CreateNewIssue />
		</div>
	);
}
