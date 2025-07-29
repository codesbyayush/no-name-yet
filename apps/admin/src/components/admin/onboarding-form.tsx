import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useOnboardingStatus } from "@/hooks/use-onboarding-new";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateBoardForm } from "./create-board-form";
import { CreateOrganizationForm } from "./create-organization-form";

export const GeneratedForm = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const search = useSearch({ from: "/_admin/onboarding" }) as { step?: string };
	const { data: onboardingStatus, isLoading } = useOnboardingStatus();

	// Initialize step based on URL param or onboarding status
	const [step, setStep] = useState(() => {
		if (search.step) {
			return Number.parseInt(search.step) - 1; // Convert to 0-based index
		}
		return 0;
	});

	const totalSteps = 2;

	// Update step based on onboarding status when it loads
	useEffect(() => {
		if (onboardingStatus && !search.step) {
			if (onboardingStatus.needsOrganization) {
				setStep(0);
			} else if (onboardingStatus.needsBoards) {
				setStep(1);
			} else if (onboardingStatus.isComplete) {
				// User is fully onboarded, redirect to admin
				navigate({ to: "/dashboard" });
			}
		}
	}, [onboardingStatus, search.step, navigate]);

	const form = useForm();

	const { handleSubmit, control, reset } = form;

	const onSubmit = async (formData: unknown) => {
		toast.success("Setup completed successfully!");
		navigate({ to: "/dashboard" });
	};

	const handleBack = () => {
		if (step > 0) {
			setStep(step - 1);
		}
	};

	const handleOrganizationSuccess = async () => {
		try {
			// Mark organization step as complete
			await client.completeOnboardingStep({ step: "organization" });

			toast.success("Organization created successfully");
			// Invalidate queries to refresh onboarding status
			queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
			setStep(1);
		} catch (error) {
			toast.error("Failed to update onboarding status");
		}
	};

	const handleBoardSuccess = async () => {
		try {
			// Mark onboarding as complete
			await client.completeOnboardingStep({ step: "complete" });

			toast.success("Board created successfully");
			// Invalidate queries to refresh onboarding status
			queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
			navigate({ to: "/boards" });
		} catch (error) {
			toast.error("Failed to update onboarding status");
		}
	};

	const handleSkipOnboarding = async () => {
		try {
			await client.skipOnboarding();
			toast.success("Onboarding skipped with defaults");
			queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
			navigate({ to: "/dashboard" });
		} catch (error) {
			toast.error("Failed to skip onboarding");
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-center">
				{Array.from({ length: totalSteps }, (_, index) => (
					<div
						key={`onboarding-step-${index + 1}`}
						className="flex items-center"
					>
						<div
							className={cn(
								"h-4 w-4 rounded-full transition-all duration-300 ease-in-out",
								index <= step ? "bg-primary" : "bg-primary/30",
								index < step && "bg-primary",
							)}
						/>
						{index < totalSteps - 1 && (
							<div
								className={cn(
									"h-0.5 w-8",
									index < step ? "bg-primary" : "bg-primary/30",
								)}
							/>
						)}
					</div>
				))}
			</div>
			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg">Welcome to Better T</CardTitle>
					<CardDescription>
						Let's set up your workspace - Step {step + 1} of {totalSteps}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{step === 0 && (
						<CreateOrganizationForm
							onSuccess={handleOrganizationSuccess}
							onError={(error) => {
								toast.error(error.message);
							}}
							buttonText="Create Organization & Continue"
						/>
					)}

					{step === 1 && (
						<div className="space-y-4">
							<CreateBoardForm
								onSuccess={handleBoardSuccess}
								onError={(error) => {
									toast.error(error.message);
								}}
								buttonText="Create Board & Finish Setup"
							/>

							<div className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleBack}
								>
									Back
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={handleSkipOnboarding}
								>
									Skip with defaults
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
