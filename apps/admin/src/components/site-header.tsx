import { Separator } from '@workspace/ui/components/separator';
import { SidebarTrigger } from '@workspace/ui/components/sidebar';

export function SiteHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          className='mx-2 data-[orientation=vertical]:h-4'
          orientation='vertical'
        />
        <h1 className='font-medium text-base'>{title}</h1>
        <div className='ml-auto flex'>{children}</div>
      </div>
    </header>
  );
}
