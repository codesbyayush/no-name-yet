import { IconBrandGithub } from '@tabler/icons-react';

export function GithubHeader() {
  return (
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
  );
}
