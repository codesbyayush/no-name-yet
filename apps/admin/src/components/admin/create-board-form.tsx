import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { client } from '@/utils/orpc';

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
  buttonText = 'Create Board',
}: CreateBoardFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and replace spaces and special chars with dashes
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(newSlug);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);

    // Auto-generate slug from name if slug is empty
    if (!slug) {
      const generatedSlug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
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

      // Mark onboarding as complete
      try {
        await client.completeOnboardingStep({ step: 'complete' });
      } catch (_error) {}

      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect to admin dashboard
        navigate({ to: '/dashboard' });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create board';
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
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <Label
              className="font-medium text-base text-card-foreground"
              htmlFor="board-name"
            >
              Board Name
            </Label>
            <Input
              className="!bg-muted h-12 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={isSubmitting}
              id="board-name"
              onChange={handleNameChange}
              placeholder="e.g., Feature Requests"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="space-y-3">
            <Label
              className="font-medium text-base text-card-foreground"
              htmlFor="board-slug"
            >
              Board URL
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-sm">
                yourorg.domain.com/
              </span>
              <Input
                className="!bg-muted h-12 flex-1 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
                id="board-slug"
                onChange={handleSlugChange}
                placeholder="feature-requests"
                required
                type="text"
                value={slug}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              This will be the URL where people can access your board
            </p>
          </div>

          <div className="space-y-3">
            <Label
              className="font-medium text-base text-card-foreground"
              htmlFor="board-description"
            >
              Description (Optional)
            </Label>
            <Input
              className="!bg-muted h-12 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={isSubmitting}
              id="board-description"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what this board is for..."
              value={description}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-muted-foreground/20 bg-muted p-4">
            <div className="space-y-0.5">
              <Label className="font-medium text-base text-card-foreground">
                Private Board
              </Label>
              <p className="text-muted-foreground text-sm">
                Only organization members can view this board
              </p>
            </div>
            <Switch
              checked={isPrivate}
              disabled={isSubmitting}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <Button
            className="h-12 w-full rounded-xl bg-primary text-base shadow-lg hover:bg-primary/90"
            disabled={isSubmitting || !name.trim() || !slug.trim()}
            type="submit"
          >
            {isSubmitting ? 'Creating...' : buttonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
