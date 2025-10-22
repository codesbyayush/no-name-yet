import { createFileRoute } from '@tanstack/react-router';
import { GithubIntegrationTest } from '@/components/admin/github-integration-test';

export const Route = createFileRoute('/_admin/settings/integrations')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='font-semibold text-2xl tracking-tight'>Integrations</h1>
        <p className='text-muted-foreground'>
          Connect your external services and tools to enhance your workflow.
        </p>
      </div>

      <GithubIntegrationTest />
    </div>
  );
}
