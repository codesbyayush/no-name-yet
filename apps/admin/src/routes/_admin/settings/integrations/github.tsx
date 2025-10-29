import { IconBrandGithub } from '@tabler/icons-react';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { useCallback, useEffect, useState } from 'react';
import { adminClient } from '@/utils/admin-orpc';

export const Route = createFileRoute('/_admin/settings/integrations/github')({
  component: RouteComponent,
});

function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [status, setStatus] = useState<
    | { linked: false }
    | {
        linked: true;
        installationId?: number;
        accountLogin?: string;
        repoCount?: number;
      }
  >({ linked: false });
  const location = useLocation();

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.github.getInstallStatus();
      setStatus(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInstallClick = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.github.getInstallUrl();
      window.open(res.url, '_blank');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get install URL');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInstallationCallback = useCallback(
    async (installationId: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminClient.github.linkInstallation({
          githubInstallationId: installationId,
        });
        if (result.success) {
          await loadStatus();
        } else {
          setError('Failed to link installation');
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Failed to link installation'
        );
      } finally {
        setLoading(false);
      }
    },
    [loadStatus]
  );

  const handleUnlinkClick = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.github.unlinkInstallation();
      if (res.success) {
        await loadStatus();
        setInfo('GitHub installation unlinked from this organization.');
      } else {
        setError('Failed to unlink installation');
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to unlink installation'
      );
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  const handleManageOnGitHub = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.github.getUninstallUrl();
      window.open(res.url, '_blank');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to open GitHub settings URL'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const params = new URLSearchParams(location.search);
    const installationId = params.get('installation_id');
    if (installationId) {
      handleInstallationCallback(Number.parseInt(installationId, 10));
    }
  }, [location.search, loadStatus, handleInstallationCallback]);

  const isLinked = status.linked === true;

  return (
    <div className='space-y-6'>
      <div className='flex items-start gap-3'>
        <span className='inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card'>
          <IconBrandGithub className='h-5 w-5' />
        </span>
        <div>
          <h1 className='font-semibold text-2xl tracking-tight'>GitHub</h1>
          <p className='text-muted-foreground'>
            Automate pull requests and keep issues synced both ways.
          </p>
        </div>
      </div>

      {error ? (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {info ? (
        <Alert>
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Connection card */}
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
                  <div>Account: {status.accountLogin}</div>
                  <div>Installation ID: {status.installationId}</div>
                  {status.repoCount ? (
                    <div>Repositories: {status.repoCount}</div>
                  ) : null}
                </div>
              </div>
            )}
            <div className='flex gap-2'>
              <Button disabled={loading} onClick={loadStatus} variant='outline'>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Install/Manage card */}
        <Card>
          <CardHeader>
            <CardTitle>Install</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button disabled={loading} onClick={handleInstallClick}>
              {isLinked ? 'Reinstall GitHub App' : 'Install GitHub App'}
            </Button>
            {isLinked && (
              <Button
                disabled={loading}
                onClick={handleManageOnGitHub}
                variant='outline'
              >
                Manage on GitHub
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Organization link card */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Link</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='text-muted-foreground'>
              <p className='text-sm'>
                Link or unlink this workspace from a GitHub App installation.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                disabled={loading || !isLinked}
                onClick={handleUnlinkClick}
                variant='destructive'
              >
                Unlink from Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
