import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateBoardForm } from "./create-board-form";
import { CreateOrganizationForm } from "./create-organization-form";
import { useOnboardingStatus } from "@/hooks/use-onboarding-new";
import { StatusFlowEditor } from "./status-flow-editor";
import { CustomTagsForm } from "./custom-tags-form";

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

  // Updated to 4 steps
  const totalSteps = 4;

  // Update step based on onboarding status when it loads
  useEffect(() => {
    if (onboardingStatus && !search.step) {
      if (onboardingStatus.needsOrganization) {
        setStep(0);
      } else if (onboardingStatus.needsBoards) {
        setStep(1);
      } else if (onboardingStatus.step === "status-flow") {
        setStep(2);
      } else if (onboardingStatus.step === "tags") {
        setStep(3);
      } else if (onboardingStatus.isComplete) {
        navigate({ to: "/dashboard" });
      }
    }
  }, [onboardingStatus, search.step, navigate]);

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = async () => {
    try {
      if (step === 2) {
        // skipping status flow -> go to tags
        await client.completeOnboardingStep({ step: "status-flow" });
        setStep(3);
        return;
      }
      if (step === 3) {
        // skip tags -> complete onboarding
        await client.completeOnboardingStep({ step: "complete" });
        toast.success("Onboarding completed");
        navigate({ to: "/dashboard" });
        return;
      }
      // For earlier steps, use existing skip
      await client.skipOnboarding();
      toast.success("Onboarding skipped with defaults");
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to update onboarding state");
    }
  };

  const handleOrganizationSuccess = async () => {
    try {
      await client.completeOnboardingStep({ step: "organization" });
      toast.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      setStep(1);
    } catch {
      toast.error("Failed to update onboarding status");
    }
  };

  const handleBoardSuccess = async () => {
    try {
      await client.completeOnboardingStep({ step: "board" });
      toast.success("Board created successfully");
      queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
      setStep(2);
    } catch {
      toast.error("Failed to update onboarding status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Centered small card container with progress
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-4 flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={`onboarding-step-${index + 1}`}
            className="flex items-center"
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300 ease-in-out",
                index <= step ? "bg-primary" : "bg-primary/30",
                index < step && "bg-primary",
              )}
            />
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6",
                  index < step ? "bg-primary" : "bg-primary/30",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="mx-auto max-w-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Welcome to Better T</CardTitle>
          <CardDescription>
            Let’s set up your workspace - Step {step + 1} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <OnboardingPreview
                title="Organizations"
                description="Create your workspace and invite your team."
              />
              <CreateOrganizationForm
                onSuccess={handleOrganizationSuccess}
                onError={(error) => toast.error(error.message)}
                buttonText="Create Organization & Continue"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <OnboardingPreview
                  title="Boards"
                  description="Organize feedback and ideas into boards."
                />
                <CreateBoardForm
                  onSuccess={handleBoardSuccess}
                  onError={(error) => toast.error(error.message)}
                  buttonText="Create Board & Continue"
                />
              </div>
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
                  onClick={handleSkip}
                >
                  Skip with defaults
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <StatusFlowEditor
                onSuccess={() => setStep(3)}
                onError={(error) => toast.error(error.message)}
                buttonText="Save Status Flow & Continue"
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
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CustomTagsForm
                onSuccess={() => {
                  toast.success("Onboarding completed");
                  navigate({ to: "/dashboard" });
                }}
                onError={(error) => toast.error(error.message)}
                buttonText="Save Tags & Finish"
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
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Minimal preview for the left column to demonstrate feature usage
function OnboardingPreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="font-semibold text-sm">{title}</div>
      <div className="mt-1 text-muted-foreground text-sm">{description}</div>
      <div className="mt-3 space-y-2">
        <div className="h-2 w-2/3 rounded bg-muted" />
        <div className="h-2 w-1/2 rounded bg-muted" />
        <div className="h-2 w-3/5 rounded bg-muted" />
      </div>
    </div>
  );
}
