import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import type { GithubInstallStatus } from '../hooks/useGithubIntegration';

export function ConnectionCard({
  status,
  isLinked,
  loading,
  onRefresh,
}: {
  status: GithubInstallStatus;
  isLinked: boolean;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Badge variant={isLinked ? 'default' : 'secondary'}>
            {isLinked ? 'Connected' : 'Not connected'}
          </Badge>
        </div>
        {isLinked && (
          <div className='text-muted-foreground'>
            <div className='space-y-1 text-sm'>
              <div>Account: {status.linked ? status.accountLogin : ''}</div>
              <div>
                Installation ID: {status.linked ? status.installationId : ''}
              </div>
              {status.linked && status.repoCount ? (
                <div>Repositories: {status.repoCount}</div>
              ) : null}
            </div>
          </div>
        )}
        <div className='flex gap-2'>
          <Button disabled={loading} onClick={onRefresh} variant='outline'>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
