import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";
import { client } from "@/utils/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";

interface CreateOrganizationFormProps {
	className?: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	buttonText?: string;
}

export function CreateOrganizationForm({
	className,
	onSuccess,
	onError,
	buttonText,
}: CreateOrganizationFormProps) {
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: session } = useSession();

	const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		//TODO: can't add dash in input but can be added if copy pasted
		const newSlug = e.target.value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
		setSlug(newSlug);
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};

	const checkSlugAvailability = async () => {
		if (!slug) {
			return;
		}
		try {
			const response = await authClient.organization.checkSlug({
				slug,
			});
			return response.data?.status;
		} catch (error) {
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const isSlugAvailable = await checkSlugAvailability();
			if (!isSlugAvailable) {
				setError(
					"This organization slug is already taken. Please choose another one.",
				);
				setIsSubmitting(false);
				return;
			}

			await authClient.organization.create({
				name,
				slug,
				userId: session?.user?.id,
			});
			await authClient.organization.setActive({
				organizationSlug: slug,
			});

			// Mark organization step as complete - TODO: remove this shittty logic
			try {
				await client.completeOnboardingStep({ step: "organization" });
			} catch (error) {}

			// Invalidate queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });

			if (onSuccess) {
				onSuccess();
			} else {
				navigate({
					to: "/boards",
					replace: true,
				});
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to create organization";
			setError(errorMessage);

			if (onError && err instanceof Error) {
				onError(err);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card className={className}>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="name">Organization Name</Label>
						<Input
							id="name"
							type="text"
							value={name}
							onChange={handleNameChange}
							placeholder="Acme Inc."
							required
							disabled={isSubmitting}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="slug">Public url</Label>
						<div className="flex items-center space-x-2">
							<Input
								id="slug"
								type="text"
								value={slug}
								onChange={handleSlugChange}
								placeholder="acme"
								required
								disabled={isSubmitting}
								className="flex-1"
							/>
							<span className="text-muted-foreground text-sm">
								.omnifeedback.tech/
							</span>
						</div>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertTitle className="sr-only">Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={isSubmitting || !name || !slug}
					>
						{isSubmitting ? (
							<>
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								<span className="ml-2">Creating...</span>
							</>
						) : (
							buttonText || "Create Organization"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
