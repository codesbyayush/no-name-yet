import { useLocation } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { useCallback, useEffect, useState } from 'react';
import { adminClient } from '@/utils/admin-orpc';

interface InstallationStatus {
  linked: boolean;
  installationId?: number;
  accountLogin?: string;
  repoCount?: number;
}

export function GithubIntegrationTest() {
  const [status, setStatus] = useState<InstallationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminClient.github.getInstallStatus();
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
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
          setError(null);
        } else {
          setError('Failed to link installation');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to link installation'
        );
      } finally {
        setLoading(false);
      }
    },
    [loadStatus]
  );

  useEffect(() => {
    loadStatus();

    // Handle GitHub setup redirect
    const searchParams = new URLSearchParams(location.search);
    const installationId = searchParams.get('installation_id');
    if (installationId) {
      handleInstallationCallback(Number.parseInt(installationId, 10));
    }
  }, [location.search, loadStatus, handleInstallationCallback]);

  const handleInstallClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminClient.github.getInstallUrl();
      window.open(result.url, '_blank');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get install URL'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkClick = async () => {
    if (!confirm('Are you sure you want to unlink the GitHub installation?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await adminClient.github.unlinkInstallation();
      if (result.success) {
        await loadStatus(); // Refresh status
        setError(null);
      } else {
        setError('Failed to unlink installation');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to unlink installation'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManageOnGitHub = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminClient.github.getUninstallUrl();
      window.open(result.url, '_blank');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get uninstall URL'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = () => {
    setLoading(true);
    setError(null);
    try {
      alert(
        'To test webhooks: Create an issue in a connected repository and watch the webhook logs in your Worker console.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration Test</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <h3 className='font-medium text-lg'>Connection Status</h3>
            {loading && <div>Loading...</div>}
            {!(loading || status) && <div>No status available</div>}
            {!loading && status && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Badge variant={status.linked ? 'default' : 'secondary'}>
                    {status.linked ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                {status.linked && (
                  <div className='space-y-1 text-muted-foreground text-sm'>
                    <div>Account: {status.accountLogin}</div>
                    <div>Installation ID: {status.installationId}</div>
                    <div>Repositories: {status.repoCount}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className='space-y-3'>
            <h3 className='font-medium text-lg'>Actions</h3>
            <div className='flex flex-wrap gap-2'>
              <Button disabled={loading} onClick={loadStatus} variant='outline'>
                Refresh Status
              </Button>

              <Button disabled={loading} onClick={handleInstallClick}>
                {status?.linked ? 'Reinstall GitHub App' : 'Install GitHub App'}
              </Button>

              {status?.linked && (
                <>
                  <Button disabled={loading} onClick={handleManageOnGitHub}>
                    Manage on GitHub
                  </Button>
                  <Button
                    disabled={loading}
                    onClick={handleUnlinkClick}
                    variant='destructive'
                  >
                    Unlink from Organization
                  </Button>
                </>
              )}

              <Button
                disabled={loading || !status?.linked}
                onClick={handleTestWebhook}
              >
                Test Webhook
              </Button>
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h3 className='font-medium text-lg'>Testing Instructions</h3>
            <div className='space-y-2 text-sm'>
              <div>
                <strong>Local Development:</strong>
                <div className='ml-2 space-y-1'>
                  <div>
                    1. Install ngrok: <code>npm install -g ngrok</code>
                  </div>
                  <div>
                    2. Start your dev server: <code>bun run dev:server</code>
                  </div>
                  <div>
                    3. Expose port: <code>ngrok http 8080</code>
                  </div>
                  <div>4. Update GitHub App webhook URL with ngrok URL</div>
                  <div>
                    5. Set Setup URL to:{' '}
                    <code>{'{ngrok-url}/api/v1/github/setup'}</code>
                  </div>
                </div>
              </div>
              <div>
                <strong>Production Testing:</strong>
                <div className='ml-2 space-y-1'>
                  <div>
                    1. Deploy Worker: <code>bun run wrangler:deploy</code>
                  </div>
                  <div>2. Set webhook URL to your Workers domain</div>
                  <div>
                    3. Set setup URL to:{' '}
                    <code>{'{workers-domain}/api/v1/github/setup'}</code>
                  </div>
                </div>
              </div>
              <div>
                <strong>Webhook Testing:</strong>
                <div className='ml-2 space-y-1'>
                  <div>1. Create an issue in a connected repository</div>
                  <div>
                    2. Check Worker logs: <code>wrangler tail</code>
                  </div>
                  <div>3. Verify database updates in your Neon database</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
