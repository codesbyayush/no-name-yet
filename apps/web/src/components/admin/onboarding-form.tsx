import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CreateOrganizationForm } from "./create-organization-form";
import { CreateBoardForm } from "./create-board-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useOnboardingStatus } from "@/hooks/use-onboarding-new";
import { useQueryClient } from "@tanstack/react-query";

export const GeneratedForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/onboarding' }) as { step?: string };
  const { data: onboardingStatus, isLoading } = useOnboardingStatus();
  
  // Initialize step based on URL param or onboarding status
  const [step, setStep] = useState(() => {
    if (search.step) {
      return parseInt(search.step) - 1; // Convert to 0-based index
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
        navigate({ to: "/admin" });
      }
    }
  }, [onboardingStatus, search.step, navigate]);

  const form = useForm();

  const { handleSubmit, control, reset } = form;

  const onSubmit = async (formData: unknown) => {
    console.log(formData);
    toast.success("Setup completed successfully!");
    navigate({ to: "/admin" });
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleOrganizationSuccess = () => {
    toast.success("Organization created successfully");
    // Invalidate queries to refresh onboarding status
    queryClient.invalidateQueries({ queryKey: ["user-boards"] });
    setStep(1);
  };

  const handleBoardSuccess = () => {
    toast.success("Board created successfully");
    // Invalidate queries to refresh onboarding status
    queryClient.invalidateQueries({ queryKey: ["user-boards"] });
    navigate({ to: "/admin" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                index <= step ? "bg-primary" : "bg-primary/30",
                index < step && "bg-primary",
              )}
            />
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5",
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
