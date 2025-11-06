import { Card, CardContent } from '@workspace/ui/components/card';
import type React from 'react';
import { useState } from 'react';
import { useAuth } from '@/contexts';
import { PUBLIC_DOMAIN_SUFFIX } from '@/features/onboarding/constants';
import { useCreateOrganization } from '@/features/onboarding/hooks/useCreateOrganization';
import { isOrganizationSlugAvailable } from '@/features/onboarding/utils/organization';
import { slugify } from '@/features/onboarding/utils/slug';
import {
  ErrorAlert,
  NameField,
  SlugField,
  SubmitButton,
} from './create-organization';

export interface CreateOrganizationFormProps {
  className?: string;
  onSuccess: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

export function CreateOrganizationForm({
  className,
  onSuccess,
  onError,
  buttonText,
}: CreateOrganizationFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);

  const { session, auth } = useAuth();
  const createOrganizationMutation = useCreateOrganization();

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //TODO: can't add dash in input but can be added if copy pasted
    const newSlug = slugify(e.target.value);
    setSlug(newSlug);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSlugError(null);

    const isSlugAvailable = await isOrganizationSlugAvailable({ auth, slug });
    if (!isSlugAvailable) {
      setSlugError(
        'This organization slug is already taken. Please choose another one.',
      );
      return;
    }

    createOrganizationMutation.mutate(
      {
        name,
        slug,
        userId: session?.user?.id,
      },
      {
        onSuccess: onSuccess,
        onError: (err) => {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to create organization';
          setSlugError(errorMessage);

          if (onError && err instanceof Error) {
            onError(err);
          }
        },
      },
    );
  };

  return (
    <Card className={className}>
      <CardContent>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <NameField
            disabled={createOrganizationMutation.isPending}
            onChange={handleNameChange}
            value={name}
          />

          <SlugField
            disabled={createOrganizationMutation.isPending}
            onChange={handleSlugChange}
            value={slug}
            domainSuffix={PUBLIC_DOMAIN_SUFFIX}
          />

          {slugError && <ErrorAlert message={slugError} />}
          {createOrganizationMutation.error && (
            <ErrorAlert
              message={
                createOrganizationMutation.error instanceof Error
                  ? createOrganizationMutation.error.message
                  : 'Failed to create organization'
              }
            />
          )}

          <SubmitButton
            disabled={createOrganizationMutation.isPending || !name || !slug}
            isSubmitting={createOrganizationMutation.isPending}
            buttonText={buttonText}
          />
        </form>
      </CardContent>
    </Card>
  );
}
