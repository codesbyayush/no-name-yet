import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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

  const { data: session } = useSession();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and replace spaces and special chars with dashes
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(newSlug);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);

    // Auto-generate slug from name if slug is empty
    if (!slug) {
      const generatedSlug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const checkSlugAvailability = async () => {
    if (!slug) return;

    try {
      const response = await authClient.organization.checkSlug({
        slug,
      });
      return response.data?.status;
    } catch (error) {
      console.error("Error checking slug availability:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if the slug is available
      const isSlugAvailable = await checkSlugAvailability();
      if (!isSlugAvailable) {
        setError(
          "This organization slug is already taken. Please choose another one.",
        );
        setIsSubmitting(false);
        return;
      }

      // Create the organization
      await authClient.organization.create({
        name,
        slug,
        userId: session?.user.id,
      });

      // Set the newly created organization as active
      await authClient.organization.setActive({
        organizationSlug: slug,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to the dashboard route
        navigate({ to: "/dashboard" });
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
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
        <CardDescription>
          Set up a new organization to collaborate with your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="slug">Organization Slug</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                example.com/
              </span>
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
            </div>
            <p className="text-xs text-muted-foreground">
              This will be used in URLs and cannot be changed later.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
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
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
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
