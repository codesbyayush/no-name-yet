import { CreateNewIssue } from "./create-new-issue";

export function CreateIssueModalProvider() {
	return (
		<div className="hidden">
			<CreateNewIssue />
		</div>
	);
}
