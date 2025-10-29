import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  ConnectionCard,
  GithubHeader,
  InstallCard,
  OrgLinkCard,
  useGithubIntegration,
} from '@/features/integrations/github';

export const Route = createFileRoute('/_admin/settings/integrations/github')({
  component: RouteComponent,
});

function RouteComponent() {
  const search =
    typeof window !== 'undefined' && typeof window.location.search === 'string'
      ? window.location.search
      : '';
  const {
    loading,
    error,
    info,
    status,
    isLinked,
    loadStatus,
    install,
    unlink,
    manageOnGitHub,
  } = useGithubIntegration(search);

  return (
    <div className='space-y-6'>
      <GithubHeader />

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
        <ConnectionCard
          isLinked={isLinked}
          loading={loading}
          onRefresh={loadStatus}
          status={status}
        />
        <InstallCard
          isLinked={isLinked}
          loading={loading}
          onInstall={install}
          onManage={manageOnGitHub}
        />
        <OrgLinkCard isLinked={isLinked} loading={loading} onUnlink={unlink} />
      </div>
    </div>
  );
}
