import { useState } from "react";
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
import { useNavigate } from "@tanstack/react-router";

export const GeneratedForm = () => {
  const [step, setStep] = useState(0);
  const totalSteps = 3;
  const navigate = useNavigate();

  const form = useForm();

  const { handleSubmit, control, reset } = form;

  const onSubmit = async (formData: unknown) => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      console.log(formData);
      toast.success("Setup completed successfully!");
      navigate({ to: "/admin/" });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

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
            Let's set up your workspace - Step {step + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <Form {...form}>
              <CreateOrganizationForm
                onSuccess={() => {
                  toast.success("Organization created successfully");
                  setStep(1);
                }}
                onError={(error) => {
                  toast.error(error.message);
                }}
                buttonText="Create Organization"
              />
            </Form>
          )}

          {step === 1 && (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
                <FormField
                  key="XXHqdVjt"
                  control={control}
                  name="XXHqdVjt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Input 1</FormLabel>
                        <FormDescription></FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  key="hOZ3I3TG"
                  control={control}
                  name="hOZ3I3TG"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Input 2</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  key="4seKlAHO"
                  control={control}
                  name="4seKlAHO"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Input 3</FormLabel>
                        <FormDescription></FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    className="font-medium"
                    size="sm"
                    onClick={handleBack}
                    disabled={step === 0}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="font-medium">
                    {step === 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 2 && (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
                <FormField
                  key="4seKlAHO"
                  control={control}
                  name="4seKlAHO"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Settings</FormLabel>
                        <FormDescription>
                          Configure your workspace settings
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    className="font-medium"
                    size="sm"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="font-medium">
                    Finish Setup
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
