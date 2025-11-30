import { createFileRoute } from '@tanstack/react-router';
import { AllRequests } from '@/features/requests/components/all-requests';
import { RequestHeader } from '@/features/requests/components/header/request-header';

export const Route = createFileRoute('/_admin/requests/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='h-svh overflow-hidden lg:p-2'>
      <div className='flex flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border'>
        <RequestHeader />
        <div className='h-[calc(100svh-80px)] w-full overflow-auto lg:h-[calc(100svh-96px)]'>
          <AllRequests />
        </div>
      </div>
    </div>
  );
}
