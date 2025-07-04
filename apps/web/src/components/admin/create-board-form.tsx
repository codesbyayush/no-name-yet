import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { client } from "@/utils/orpc";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CreateBoardFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

export function CreateBoardForm({
  className,
  onSuccess,
  onError,
  buttonText = "Create Board",
}: CreateBoardFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the board
      await client.createBoard({
        name,
        slug,
        description: description || undefined,
        isPrivate,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect to admin dashboard
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create board";
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
        <CardTitle>Create Your First Board</CardTitle>
        <CardDescription>
          Boards help you organize feedback, feature requests, and discussions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="board-name"
              className="text-base font-medium text-card-foreground"
            >
              Board Name
            </Label>
            <Input
              id="board-name"
              type="text"
              placeholder="e.g., Feature Requests"
              value={name}
              onChange={handleNameChange}
              required
              disabled={isSubmitting}
              className="rounded-xl border-muted-foreground/20 !bg-muted h-12 text-base px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="board-slug"
              className="text-base font-medium text-card-foreground"
            >
              Board URL
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                yourorg.domain.com/
              </span>
              <Input
                id="board-slug"
                type="text"
                placeholder="feature-requests"
                value={slug}
                onChange={handleSlugChange}
                required
                disabled={isSubmitting}
                className="flex-1 rounded-xl border-muted-foreground/20 !bg-muted h-12 text-base px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will be the URL where people can access your board
            </p>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="board-description"
              className="text-base font-medium text-card-foreground"
            >
              Description (Optional)
            </Label>
            <Input
              id="board-description"
              placeholder="Describe what this board is for..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescription(e.target.value)
              }
              disabled={isSubmitting}
              className="rounded-xl border-muted-foreground/20 !bg-muted h-12 text-base px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border-muted-foreground/20 border bg-muted p-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium text-card-foreground">
                Private Board
              </Label>
              <p className="text-sm text-muted-foreground">
                Only organization members can view this board
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl h-12 text-base bg-primary hover:bg-primary/90 shadow-lg"
            disabled={isSubmitting || !name.trim() || !slug.trim()}
          >
            {isSubmitting ? "Creating..." : buttonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
