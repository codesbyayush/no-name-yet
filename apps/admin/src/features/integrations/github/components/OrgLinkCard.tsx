import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';

export function OrgLinkCard({
  isLinked,
  loading,
  onUnlink,
}: {
  isLinked: boolean;
  loading: boolean;
  onUnlink: () => void;
}) {
  return (
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
            onClick={onUnlink}
            variant='destructive'
          >
            Unlink from Organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
