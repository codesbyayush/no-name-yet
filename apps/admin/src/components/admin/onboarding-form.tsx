import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { CreateOrganizationForm } from "./create-organization-form";

export const GeneratedForm = () => {
	const navigate = useNavigate();

	const handleOrganizationSuccess = async () => {
		navigate({ to: "/boards", replace: true, search: {} as any });
	};

	return (
		<div className="mx-auto max-w-lg py-8">
			<Card className="w-full border-none bg-transparent shadow-sm">
				<CardHeader className="pb-2 text-center">
					<CardTitle className="py-1 text-xl">
						Create a new organization
					</CardTitle>
					<CardDescription>
						Organizations are top level shared spaces for your team
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<CreateOrganizationForm
						onSuccess={handleOrganizationSuccess}
						buttonText="Create Organization & Continue"
					/>
				</CardContent>
			</Card>
		</div>
	);
};
