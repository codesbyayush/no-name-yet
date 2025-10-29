import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';

export function InstallCard({
  isLinked,
  loading,
  onInstall,
  onManage,
}: {
  isLinked: boolean;
  loading: boolean;
  onInstall: () => void;
  onManage: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Install</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Button disabled={loading} onClick={onInstall}>
          {isLinked ? 'Reinstall GitHub App' : 'Install GitHub App'}
        </Button>
        {isLinked && (
          <Button disabled={loading} onClick={onManage} variant='outline'>
            Manage on GitHub
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
