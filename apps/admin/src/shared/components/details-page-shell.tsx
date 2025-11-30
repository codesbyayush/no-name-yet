import { Link } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import { SidebarTrigger } from '@workspace/ui/components/sidebar';
import { ArrowLeft } from 'lucide-react';

interface DetailsPageShellProps {
  backLink: {
    to: string;
    label: string;
  };
  headerRight?: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function DetailsPageShell({
  backLink,
  headerRight,
  sidebar,
  children,
}: DetailsPageShellProps) {
  return (
    <div className='flex h-svh w-full overflow-hidden lg:p-2'>
      <div className='flex flex-1 overflow-hidden bg-container lg:rounded-md lg:border'>
        {/* Main Content */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Header */}
          <header className='flex h-10 w-full shrink-0 items-center gap-2 border-b px-6 py-1.5'>
            <SidebarTrigger className='' />
            <Separator orientation='vertical' className='mx-2 h-4' />
            <Link to={backLink.to}>
              <Button variant='ghost' size='sm' className='gap-1.5'>
                <ArrowLeft className='size-3.5' />
                {backLink.label}
              </Button>
            </Link>
            {headerRight && (
              <div className='ml-auto flex items-center gap-2'>
                {headerRight}
              </div>
            )}
          </header>

          {/* Content Area */}
          <div className='flex-1 overflow-y-auto'>{children}</div>
        </div>

        {/* Sidebar */}
        {sidebar}
      </div>
    </div>
  );
}
