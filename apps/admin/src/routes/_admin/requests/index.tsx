import { createFileRoute } from '@tanstack/react-router';
import { RequestIssues } from '@/features/requests';
import { SiteHeader } from '@/shared/layout/site-header';

export const Route = createFileRoute('/_admin/requests/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='h-svh overflow-hidden lg:p-2'>
      <div className='flex flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border'>
        <SiteHeader title='Requested Issues' />
        <div className='h-[calc(100svh-40px)] w-full overflow-auto lg:h-[calc(100svh-56px)]'>
          <RequestIssues />
        </div>
      </div>
    </div>
  );
}
