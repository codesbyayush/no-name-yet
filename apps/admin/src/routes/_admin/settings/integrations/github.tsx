import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { GithubIntegrationTest } from '@/components/admin/github-integration-test';

export const Route = createFileRoute('/_admin/settings/integrations/github')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='font-semibold text-2xl tracking-tight'>GitHub</h1>
        <p className='text-muted-foreground'>
          Connect your GitHub App, manage linking, and test webhooks.
        </p>
      </div>

      <Separator />

      {/* Core integration controls reused from existing component */}
      <GithubIntegrationTest />

      {/* Placeholder for future granular settings, using shared UI only */}
      <Card>
        <CardHeader>
          <CardTitle>Additional settings</CardTitle>
        </CardHeader>
        <CardContent className='text-muted-foreground text-sm'>
          Configure repository-level permissions, linkbacks, and magic words
          here when available.
        </CardContent>
      </Card>
    </div>
  );
}
