import { cn } from '@workspace/ui/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role='radiogroup'
      aria-label='Theme selection'
      className='flex items-center gap-2 w-full '
    >
      <label
        className={cn(
          'flex items-center justify-center aspect-square size-8 shrink-0 rounded-md border border-input transition-all hover:bg-accent hover:text-foreground focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/50 cursor-pointer',
          theme === 'light' && 'text-primary-foreground border-primary',
        )}
      >
        <input
          type='radio'
          name='theme'
          value='light'
          checked={theme === 'light'}
          onChange={() => setTheme('light')}
          className='sr-only'
          aria-label='Light theme'
        />
        <Sun className='size-4' />
      </label>
      <label
        className={cn(
          'flex items-center justify-center aspect-square size-8 shrink-0 rounded-md border border-input transition-all hover:bg-accent hover:text-foreground focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/50 cursor-pointer',
          theme === 'dark' && 'text-primary-foreground border-primary',
        )}
      >
        <input
          type='radio'
          name='theme'
          value='dark'
          checked={theme === 'dark'}
          onChange={() => setTheme('dark')}
          className='sr-only'
          aria-label='Dark theme'
        />
        <Moon className='size-4' />
      </label>
      <label
        className={cn(
          'flex items-center justify-center aspect-square size-8 shrink-0 rounded-md border border-input transition-all hover:bg-accent hover:text-foreground focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/50 cursor-pointer',
          theme === 'system' && 'text-primary-foreground border-primary',
        )}
      >
        <input
          type='radio'
          name='theme'
          value='system'
          checked={theme === 'system'}
          onChange={() => setTheme('system')}
          className='sr-only'
          aria-label='System theme'
        />
        <Monitor className='size-4' />
      </label>
    </div>
  );
}
