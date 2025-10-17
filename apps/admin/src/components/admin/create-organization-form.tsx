import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, useSession } from '@/lib/auth-client';

interface CreateOrganizationFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function CreateOrganizationForm({
  className,
  onSuccess,
  onError,
  buttonText,
}: CreateOrganizationFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const _queryClient = useQueryClient();

  const { data: session } = useSession();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //TODO: can't add dash in input but can be added if copy pasted
    const newSlug = slugify(e.target.value);
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
    } catch (_error) {
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
          'This organization slug is already taken. Please choose another one.'
        );
        setIsSubmitting(false);
        return;
      }

      const org = await authClient.organization.create({
        name,
        slug,
        userId: session?.user?.id,
      });
      await authClient.organization.setActive({
        organizationSlug: org.data?.slug,
        organizationId: org.data?.id,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate({ to: '/boards', replace: true, search: {} as any });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create organization';
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              disabled={isSubmitting}
              id="name"
              onChange={handleNameChange}
              placeholder="OpenFeedback"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Public url</Label>
            <div className="flex items-center space-x-2">
              <Input
                className="flex-1"
                disabled={isSubmitting}
                id="slug"
                onChange={handleSlugChange}
                onPaste={(e) =>
                  handleSlugChange(
                    e as unknown as React.ChangeEvent<HTMLInputElement>
                  )
                }
                placeholder="openfeedback"
                required
                type="text"
                value={slug}
              />
              <span className="text-muted-foreground text-sm">
                .openfeedback.tech/
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
            className="w-full"
            disabled={isSubmitting || !name || !slug}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              buttonText || 'Create Organization'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
