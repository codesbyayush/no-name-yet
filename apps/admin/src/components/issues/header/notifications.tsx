import { RiSlackLine } from '@remixicon/react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState({
    teamIssueAdded: false,
    issueCompleted: false,
    issueAddedToTriage: false,
  });

  const handleCheckboxChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label='Notifications'
          className='relative h-8 w-8'
          size='icon'
          variant='ghost'
        >
          <Bell className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='px-4 pt-3 pb-3'>
          <h3 className='mb-3 font-medium text-sm'>Inbox notifications</h3>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label
                className='flex-1 cursor-pointer text-muted-foreground text-xs'
                htmlFor='team-issue-added'
              >
                An issue is added to the team
              </label>
              <Checkbox
                checked={notifications.teamIssueAdded}
                id='team-issue-added'
                onCheckedChange={() => handleCheckboxChange('teamIssueAdded')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <label
                className='flex-1 cursor-pointer text-muted-foreground text-xs'
                htmlFor='issue-completed'
              >
                An issue is marked completed or canceled
              </label>
              <Checkbox
                checked={notifications.issueCompleted}
                id='issue-completed'
                onCheckedChange={() => handleCheckboxChange('issueCompleted')}
              />
            </div>

            <div className='flex items-center justify-between'>
              <label
                className='flex-1 cursor-pointer text-muted-foreground text-xs'
                htmlFor='issue-triage'
              >
                An issue is added to the triage queue
              </label>
              <Checkbox
                checked={notifications.issueAddedToTriage}
                id='issue-triage'
                onCheckedChange={() =>
                  handleCheckboxChange('issueAddedToTriage')
                }
              />
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between border-t px-4 py-2'>
          <div className='flex items-center gap-2'>
            <RiSlackLine className='size-4' />
            <span className='font-medium text-xs'>Slack notifications</span>
          </div>
          <Button size='sm' variant='outline'>
            Configure
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
