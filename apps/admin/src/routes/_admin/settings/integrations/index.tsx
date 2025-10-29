import {
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandSlack,
} from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';

export const Route = createFileRoute('/_admin/settings/integrations/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='font-semibold text-lg tracking-tight'>Integrations</h1>
        <p className='text-muted-foreground text-sm'>
          Connect your external services and tools to enhance your workflow.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <IntegrationCard
          description='Automate pull request and commit workflows; keep issues in sync.'
          Icon={IconBrandGithub}
          title='GitHub'
          to='/settings/integrations/github'
        />

        <IntegrationCard
          description='Create issues from Slack messages and sync threads.'
          disabled
          Icon={IconBrandSlack}
          title='Slack'
          to='/settings/integrations/slack'
        />

        <IntegrationCard
          description='Automate your Merge Request workflow.'
          disabled
          Icon={IconBrandGitlab}
          title='GitLab'
          to='/settings/integrations/gitlab'
        />
      </div>
    </div>
  );
}

function IntegrationCard({
  to,
  title,
  description,
  Icon,
  disabled,
}: {
  to: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}) {
  const content = (
    <Card className={disabled ? 'opacity-60' : ''}>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <span className='inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card'>
            <Icon className='h-5 w-5' />
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return content;
  }
  return (
    <Link
      className='block focus:outline-none focus:ring-2 focus:ring-ring'
      to={to}
    >
      {content}
    </Link>
  );
}
