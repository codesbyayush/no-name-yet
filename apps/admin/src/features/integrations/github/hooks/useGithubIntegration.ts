import { useCallback, useEffect, useState } from 'react';
import { adminClient } from '@/utils/admin-orpc';

export type GithubInstallStatus =
  | { linked: false }
  | {
      linked: true;
      installationId?: number;
      accountLogin?: string;
      repoCount?: number;
    };

export function useGithubIntegration(locationSearch: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [status, setStatus] = useState<GithubInstallStatus>({ linked: false });

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

  const install = useCallback(async () => {
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

  const linkInstallation = useCallback(
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

  const unlink = useCallback(async () => {
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

  const manageOnGitHub = useCallback(async () => {
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
    const params = new URLSearchParams(locationSearch);
    const installationId = params.get('installation_id');
    if (installationId) {
      linkInstallation(Number.parseInt(installationId, 10));
    }
  }, [locationSearch, loadStatus, linkInstallation]);

  const isLinked = status.linked === true;

  return {
    // state
    loading,
    error,
    info,
    status,
    isLinked,
    // actions
    setInfo,
    loadStatus,
    install,
    linkInstallation,
    unlink,
    manageOnGitHub,
  };
}
