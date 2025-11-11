import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import { cn } from '@workspace/ui/lib/utils';
import { CheckIcon, UserCircle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useIssues } from '@/react-db/issues';
import { useUsers } from '@/react-db/users';

interface AssigneeSelectorProps {
  assigneeId?: string | null;
  onChange: (assignee?: string | null) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'secondary' | 'ghost';
}

export function AssigneeSelector({
  assigneeId,
  onChange,
  size = 'default',
  variant = 'secondary',
}: AssigneeSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | null>(assigneeId || null);

  const { data: issues } = useIssues();
  const { data: users } = useUsers();

  const selectedUser = users?.find((user) => user.id === value);

  useEffect(() => {
    setValue(assigneeId || null);
  }, [assigneeId]);

  const handleAssigneeChange = (userId: string) => {
    if (userId === 'unassigned') {
      setValue(null);
      onChange(null);
    } else {
      setValue(userId);
      const newAssignee = users?.find((u) => u.id === userId) || null;
      if (newAssignee) {
        onChange(newAssignee.id);
      }
    }
    setOpen(false);
  };

  return (
    <div className='*:not-first:mt-2'>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              'flex items-center justify-center py-1.5 px-3',
              size === 'icon' ? 'size-7' : 'size-full',
            )}
            id={id}
            role='combobox'
            size={size}
            variant={variant}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedUser ? (
              <Avatar className='size-5'>
                <AvatarImage
                  alt={selectedUser.name}
                  src={selectedUser.image || ''}
                />
                <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <UserCircle className='size-5' />
            )}
            {size !== 'icon' && (
              <span>{selectedUser?.name || 'Unassigned'}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-full min-w-(--radix-popper-anchor-width) border-input p-0'
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder='Assign to...' />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  className='flex items-center justify-between'
                  onSelect={() => handleAssigneeChange('unassigned')}
                  value='unassigned'
                >
                  <div className='flex items-center gap-2'>
                    <UserCircle className='size-5' />
                    Unassigned
                  </div>
                  {value === null && (
                    <CheckIcon className='ml-auto' size={16} />
                  )}
                  <span className='text-muted-foreground text-xs'>
                    {issues?.filter((is) => is.assigneeId === null).length ?? 0}
                  </span>
                </CommandItem>
                {(users ?? []).map((user) => (
                  <CommandItem
                    className='flex items-center justify-between'
                    key={user.id}
                    onSelect={() => handleAssigneeChange(user.id)}
                    value={user.id}
                  >
                    <div className='flex items-center gap-2 capitalize'>
                      <Avatar className='size-5'>
                        <AvatarImage alt={user.name} src={user.image || ''} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                    {value === user.id && (
                      <CheckIcon className='ml-auto' size={16} />
                    )}
                    <span className='text-muted-foreground text-xs'>
                      {issues?.filter((is) => is.assigneeId === user.id)
                        .length ?? 0}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
