import { useSession } from "@/lib/auth-client";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export interface OnboardingStatus {
	step: "organization" | "board" | "complete";
	needsOrganization: boolean;
	needsBoards: boolean;
	isComplete: boolean;
	organizationId?: string;
	organizationName?: string;
	organizationSlug?: string;
}

export function useOnboardingStatus(): {
	data: OnboardingStatus;
	isLoading: boolean;
	error: any;
} {
	const { data: session, isPending: sessionLoading } = useSession();

	const {
		data: onboardingData,
		isLoading: onboardingLoading,
		error,
	} = useQuery({
		queryKey: ["onboarding-status"],
		queryFn: () => client.getOnboardingStatus(),
		enabled: !!session?.user?.id,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const isLoading = sessionLoading || onboardingLoading;

	if (isLoading || !session) {
		return { data: undefined, isLoading, error };
	}

	return {
		data: onboardingData as unknown as OnboardingStatus,
		isLoading: false,
		error,
	};
}

export function useSubdomainContext() {
	// Simple implementation for now - can be enhanced later
	const hostname =
		typeof window !== "undefined" ? window.location.hostname : "";
	const isMainApp = hostname.includes("app.") || hostname === "localhost";

	return {
		isMainApp,
		subdomain: isMainApp ? undefined : hostname.split(".")[0],
	};
}

export function shouldRedirectToOnboarding(
	onboardingStatus: OnboardingStatus | undefined,
	subdomainContext: ReturnType<typeof useSubdomainContext>,
): { shouldRedirect: boolean; reason: string; step?: number } {
	if (!onboardingStatus) {
		return { shouldRedirect: false, reason: "Loading..." };
	}

	const { isMainApp } = subdomainContext;

	// Only redirect if we're on the main app (app.domain.com)
	if (!isMainApp) {
		return { shouldRedirect: false, reason: "Not on main app domain" };
	}

	// If user needs organization
	if (onboardingStatus.needsOrganization) {
		return {
			shouldRedirect: true,
			reason: "User needs organization setup",
			step: 1,
		};
	}

	// If user has organization but needs boards
	if (onboardingStatus.needsBoards) {
		return {
			shouldRedirect: true,
			reason: "User has organization but needs to create boards",
			step: 2,
		};
	}

	return { shouldRedirect: false, reason: "Onboarding complete" };
}
