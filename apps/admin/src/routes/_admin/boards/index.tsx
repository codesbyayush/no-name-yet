import { createFileRoute } from '@tanstack/react-router';
import AllIssues from '@/components/issues/all-issues';
import { CreateIssueModalProvider } from '@/components/issues/create-issue-modal-provider';
import Header from '@/components/issues/header/header';

export const Route = createFileRoute('/_admin/boards/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='h-svh overflow-hidden lg:p-2'>
      <CreateIssueModalProvider />
      <div className='flex flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border'>
        <Header />
        <div className='h-[calc(100svh-80px)] w-full overflow-auto lg:h-[calc(100svh-96px)]'>
          <AllIssues />
        </div>
      </div>
    </div>
  );
}
