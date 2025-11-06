import { useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { CreateOrganizationForm } from './create-organization-form';

export const OnboardingForm = () => {
  const navigate = useNavigate();

  const handleOrganizationSuccess = () => {
    navigate({
      to: '/boards',
      replace: true,
      search: {} as unknown as Record<string, never>,
    });
  };

  return (
    <div className='mx-auto max-w-lg py-8'>
      <Card className='w-full border-none bg-transparent shadow-sm'>
        <CardHeader className='pb-2 text-center'>
          <CardTitle className='py-1 text-xl'>
            Create a new organization
          </CardTitle>
          <CardDescription>
            Organizations are top level shared spaces for your team
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CreateOrganizationForm
            buttonText='Create Organization & Continue'
            onSuccess={handleOrganizationSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
};
