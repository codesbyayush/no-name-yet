import { Link } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

interface PageLoadingStateProps {
  title?: string;
  subtitle?: string;
}

export function PageLoadingState({
  title = 'Loading...',
  subtitle = 'Fetching data',
}: PageLoadingStateProps) {
  return (
    <div className='flex h-svh w-full items-center justify-center lg:p-2'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-muted/50'>
          <div className='size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
        </div>
        <div className='text-center'>
          <h3 className='font-medium text-foreground text-sm'>{title}</h3>
          <p className='mt-1 text-muted-foreground text-xs'>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

interface PageNotFoundStateProps {
  icon: LucideIcon;
  title?: string;
  subtitle?: string;
  backLink?: {
    to: string;
    label: string;
  };
}

export function PageNotFoundState({
  icon: Icon,
  title = 'Not found',
  subtitle = 'The item you are looking for does not exist',
  backLink,
}: PageNotFoundStateProps) {
  return (
    <div className='flex h-svh w-full items-center justify-center lg:p-2'>
      <div className='flex flex-col items-center gap-4 px-4 text-center'>
        <div className='flex size-16 items-center justify-center rounded-2xl bg-muted/50'>
          <Icon className='size-8 text-muted-foreground/50' />
        </div>
        <div>
          <h3 className='font-semibold text-foreground'>{title}</h3>
          <p className='mt-1.5 max-w-xs text-muted-foreground text-sm'>
            {subtitle}
          </p>
        </div>
        {backLink && (
          <Link to={backLink.to}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-1.5 size-3.5' />
              {backLink.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

interface PageEmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export function PageEmptyState({
  icon: Icon,
  title,
  subtitle,
  iconClassName,
  children,
}: PageEmptyStateProps) {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-4 px-4'>
      <div className='flex size-16 items-center justify-center rounded-2xl bg-muted/50'>
        <Icon className={iconClassName || 'size-8 text-muted-foreground/50'} />
      </div>
      <div className='text-center'>
        <h3 className='font-semibold text-foreground'>{title}</h3>
        {subtitle && (
          <p className='mt-1.5 max-w-xs text-muted-foreground text-sm'>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
