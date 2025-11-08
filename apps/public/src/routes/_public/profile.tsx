import { createFileRoute } from '@tanstack/react-router';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authClient, useSession } from '@/lib/auth-client';

export const Route = createFileRoute('/_public/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [name, setName] = useState<string>(user?.name ?? '');

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
    }
  }, [user]);

  const fallbackInitial = useMemo(
    () => (name?.trim()?.charAt(0) || 'U').toLowerCase(),
    [name],
  );

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await authClient.updateUser({
      name,
    });
    toast.success('Profile saved');
  };

  return (
    <div className='text-card-foreground'>
      <div className='relative flex justify-center'>
        <div className='w-2xl flex-1 rounded-3xl border border-muted-foreground/10 bg-linear-to-bl from-card-foreground/5 to-card shadow-xs'>
          <form className='space-y-6 p-6' onSubmit={onSave}>
            <div className='space-y-1'>
              <h2 className='font-semibold text-xl'>Personal Information</h2>
              <p className='text-muted-foreground text-sm'>
                Your personal information is not shared with anyone.
              </p>
            </div>

            <div className='flex items-end gap-2'>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  disabled={isPending}
                  id='name'
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Your name'
                  value={name}
                />
              </div>
              <Avatar className='h-12 w-12 rounded-lg'>
                <AvatarImage alt='Avatar' src={user?.image || ''} />
                <AvatarFallback className='rounded-lg'>
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='email'>Email</Label>
                <span className='text-muted-foreground text-xs'>
                  Invisible to public
                </span>
              </div>
              <Input
                disabled
                id='email'
                placeholder='Email'
                readOnly
                value={user?.email ?? ''}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='account-id'>Account ID</Label>
              <Input
                disabled
                id='account-id'
                placeholder='Account ID'
                readOnly
                value={user?.id ?? ''}
              />
            </div>

            <div>
              <Button disabled={isPending} type='submit'>
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
