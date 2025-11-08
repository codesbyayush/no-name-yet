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
import { CheckIcon, UserCircle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useIssues } from '@/react-db/issues';
import { useUsers } from '@/react-db/users';

interface AssigneeSelectorProps {
  assigneeId: string | undefined;
  onChange: (assignee?: string) => void;
}

export function AssigneeSelector({
  assigneeId,
  onChange,
}: AssigneeSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | null>(assigneeId || null);

  const { data: issues } = useIssues();
  const { data: users } = useUsers();

  useEffect(() => {
    setValue(assigneeId || null);
  }, [assigneeId]);

  const handleAssigneeChange = (userId: string) => {
    if (userId === 'unassigned') {
      setValue(null);
      onChange();
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
            className='flex items-center justify-center capitalize'
            id={id}
            role='combobox'
            size='sm'
            variant='secondary'
          >
            {value ? (
              (() => {
                const selectedUser = users?.find((user) => user.id === value);
                if (selectedUser) {
                  return (
                    <Avatar className='size-5'>
                      <AvatarImage
                        alt={selectedUser.name}
                        src={selectedUser.image || ''}
                      />
                      <AvatarFallback>
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  );
                }
                return <UserCircle className='size-5' />;
              })()
            ) : (
              <UserCircle className='size-5' />
            )}
            <span>
              {value
                ? users?.find((user) => user.id === value)?.name
                : 'Unassigned'}
            </span>
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
                    {issues?.filter((is) => is.assignee === null).length ?? 0}
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
                      {issues?.filter((is) => is.assignee?.id === user.id)
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
