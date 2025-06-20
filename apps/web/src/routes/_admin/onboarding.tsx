import { createFileRoute } from "@tanstack/react-router";
import { GeneratedForm } from "@/components/admin/onboarding-form";
import { useSession } from "@/lib/auth-client";
import { Navigate } from "@tanstack/react-router";
import { z } from "zod";

const onboardingSearchSchema = z.object({
  step: z.string().optional(),
});

export const Route = createFileRoute("/_admin/onboarding")({
  component: OnboardingPage,
  validateSearch: onboardingSearchSchema,
});

function OnboardingPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!session) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Better T</h1>
        <p className="text-muted-foreground mt-2">
          Let's get you set up with everything you need
        </p>
      </div>
      <GeneratedForm />
    </div>
  );
}
