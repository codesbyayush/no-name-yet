import { IconArrowLeft } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { ChangelogForm } from '@/components/admin/changelog-form';
import { SiteHeader } from '@/components/site-header';

export const Route = createFileRoute('/_admin/changelogs/new')({
  component: CreateChangelogPage,
});

function CreateChangelogPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: '/changelogs' });
  };

  return (
    <>
      <SiteHeader title='Create Changelog'>
        <Button asChild variant='outline'>
          <Link to='/changelogs'>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Back to Changelogs
          </Link>
        </Button>
      </SiteHeader>

      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='px-4 lg:px-6'>
              <div className='mx-auto max-w-4xl'>
                <div className='mb-6'>
                  <h1 className='mb-2 font-semibold text-2xl'>
                    Create New Changelog
                  </h1>
                  <p className='text-muted-foreground'>
                    Create a new changelog entry to document product updates and
                    changes.
                  </p>
                </div>

                <ChangelogForm mode='create' onSuccess={handleSuccess} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
