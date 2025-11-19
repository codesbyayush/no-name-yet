import { Link, useNavigate } from '@tanstack/react-router';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { LogOut, Monitor, Moon, Plus, Sun, User } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { authClient } from '@/lib/auth-client';

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme();

  const logout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/auth',
            search: { redirect: '/board' },
          });
        },
      },
    });
  };

  if (isPending) {
    return <Skeleton className='h-10 w-10 rounded-full' />;
  }

  if (!session) {
    return (
      <Button asChild variant='outline'>
        <Link to='/auth'>Sign In</Link>
      </Button>
    );
  }

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='relative h-10 w-10 rounded-full' variant='ghost'>
          <Avatar className='size-8'>
            <AvatarImage alt={user?.name || 'User'} src={user?.image || ''} />
            <AvatarFallback className='bg-primary/10'>
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
        sideOffset={4}
      >
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <Avatar className='h-8 w-8 rounded-lg'>
              <AvatarImage alt={user?.name || 'User'} src={user?.image || ''} />
              <AvatarFallback className='rounded-lg'>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{user?.name}</span>
              {!session.user.isAnonymous && (
                <span className='truncate text-xs'>{user?.email}</span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              navigate({ href: import.meta.env.VITE_ADMIN_ROOT_URL })
            }
          >
            <Plus className='h-4 w-4' />
            Create your own
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/profile'>
              <User className='h-4 w-4' />
              Profile
            </Link>
          </DropdownMenuItem>

          {/* Theme Selector */}
          <div className='p-2'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 pr-2 font-medium text-sm'>
                {(() => {
                  if (theme === 'light') return <Sun className='size-4' />;
                  if (theme === 'dark') return <Moon className='size-4' />;
                  return <Monitor className='size-4' />;
                })()}
                <span>Theme</span>
              </div>
              <div className='flex items-center gap-1 px-2'>
                <button
                  className={`flex items-center justify-center rounded-md p-2 transition-all ${
                    theme === 'light'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  onClick={() => setTheme('light')}
                  title='Light theme'
                  type='button'
                >
                  <Sun className='size-4' />
                </button>
                <button
                  className={`flex items-center justify-center rounded-md p-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  onClick={() => setTheme('dark')}
                  title='Dark theme'
                  type='button'
                >
                  <Moon className='size-4' />
                </button>
                <button
                  className={`flex items-center justify-center rounded-md p-2 transition-all ${
                    theme === 'system'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  onClick={() => setTheme('system')}
                  title='System theme'
                  type='button'
                >
                  <Monitor className='size-4' />
                </button>
              </div>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {session &&
          (session.user.isAnonymous ? (
            <DropdownMenuItem
              onClick={() =>
                navigate({ to: '/auth', search: { redirect: '/board' } })
              }
            >
              <LogOut />
              Sign in
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
