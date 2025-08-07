import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { client } from "@/utils/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CreateOrganizationForm } from "./create-organization-form";

export const GeneratedForm = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const handleOrganizationSuccess = async () => {
		try {
			await client.completeOnboardingStep({ step: "organization" });
			toast.success("Organization created successfully");
			queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
			navigate({ to: "/boards", replace: true });
		} catch {
			toast.error("Failed to update onboarding status");
		}
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
						onError={(error) => toast.error(error.message)}
						buttonText="Create Organization & Continue"
					/>
				</CardContent>
			</Card>
		</div>
	);
};
