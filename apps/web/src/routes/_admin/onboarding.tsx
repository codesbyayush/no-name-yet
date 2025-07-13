import { GeneratedForm } from "@/components/admin/onboarding-form";
import { useSession } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!session) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Welcome to Better T</h1>
        <p className="mt-2 text-muted-foreground">
          Let's get you set up with everything you need
        </p>
      </div>
      <GeneratedForm />
    </div>
  );
}
