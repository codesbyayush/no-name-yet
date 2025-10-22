import { DialogTitle } from '@radix-ui/react-dialog';
import { RiEditLine } from '@remixicon/react';
import { Box, Heart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Issue } from '@/mock-data/issues';
import { ranks } from '@/mock-data/issues';
import { priorities } from '@/mock-data/priorities';
import { status } from '@/mock-data/status';
import { users } from '@/mock-data/users';
import { useBoards } from '@/react-db/boards';
import { useAddIssue, useIssues } from '@/react-db/issues';
import { useCreateIssueStore } from '@/store/create-issue-store';
import { AssigneeSelector } from './assignee-selector';
import { LabelSelector } from './label-selector';
import { PrioritySelector } from './priority-selector';
import { ProjectSelector } from './project-selector';
import { StatusSelector } from './status-selector';

export function CreateNewIssue() {
  const [createMore, setCreateMore] = useState<boolean>(false);
  const { isOpen, defaultStatusKey, openModal, closeModal } =
    useCreateIssueStore();
  const { data: issues } = useIssues();
  const addIssue = useAddIssue();

  const generateUniqueIdentifier = () => {
    const identifiers = (issues ?? []).map((issue) => issue.issueKey);
    let identifier = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');
    while (identifiers.includes(`LNUI-${identifier}`)) {
      identifier = Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, '0');
    }
    return identifier;
  };

  const { data: boards } = useBoards();

  const mappedProjects = useMemo(
    () =>
      (boards ?? []).map((b, idx) => {
        const Icon = Box;
        return {
          id: b.id,
          name: b.name,
          status: status[idx % status.length],
          icon: Icon,
          percentComplete: 0,
          startDate: new Date().toISOString().slice(0, 10),
          lead: users[idx % users.length],
          priority: priorities[idx % priorities.length],
          health: {
            id: 'on-track' as
              | 'no-update'
              | 'off-track'
              | 'on-track'
              | 'at-risk',
            name: 'On Track',
            color: '#00FF00',
            description: '',
          },
        };
      }),
    [boards]
  );

  const createDefaultData = useCallback(() => {
    const identifier = generateUniqueIdentifier();
    return {
      id: uuidv4(),
      identifier: `LNUI-${identifier}`,
      issueKey: `LNUI-${identifier}`,
      title: '',
      description: '',
      status:
        status.find((s) => s.key === defaultStatusKey) ||
        status.find((s) => s.key === 'to-do')!,
      statusKey: defaultStatusKey,
      assigneeId: undefined,
      assignee: null,
      priority: priorities.find((p) => p.id === 'no-priority')!,
      priorityKey: 'no-priority',
      labels: [],
      createdAt: new Date().toISOString(),
      project: mappedProjects[0],
      subissues: [],
      rank: ranks.at(-1)!,
      tags: [],
    };
  }, [defaultStatusKey]);

  const [addIssueForm, setAddIssueForm] = useState<Issue>(createDefaultData());

  useEffect(() => {
    if (isOpen) {
      if (createDefaultData().project === undefined) {
        setAddIssueForm({ ...createDefaultData(), project: mappedProjects[0] });
      } else {
        setAddIssueForm(createDefaultData());
      }
    }
  }, [isOpen, createDefaultData]);

  const createIssue = () => {
    if (!addIssueForm.title) {
      toast.error('Title is required');
      return;
    }
    if (!addIssueForm.description) {
      toast.error('Description is required');
      return;
    }
    if (!addIssueForm.project) {
      toast.error('Project is required');
      return;
    }
    addIssue.mutate(addIssueForm);
    toast.success('Issue created');
    if (!createMore) {
      closeModal();
    }
    setAddIssueForm(createDefaultData());
  };

  return (
    <Dialog
      onOpenChange={(value) => (value ? openModal() : closeModal())}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button className='size-8 shrink-0' size='icon' variant='secondary'>
          <RiEditLine />
        </Button>
      </DialogTrigger>
      <DialogContent className='top-[30%] w-full p-0 shadow-xl sm:max-w-[750px]'>
        <DialogHeader>
          <DialogTitle>
            <div className='flex items-center gap-2 px-4 pt-4'>
              <Button className='gap-1.5' size='sm' variant='outline'>
                <Heart className='size-4 fill-orange-500 text-orange-500' />
                <span className='font-medium capitalize'>new issue</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className='w-full space-y-3 px-4 pb-0'>
          <Input
            autoFocus
            className='h-auto w-full overflow-hidden text-ellipsis whitespace-normal break-words border-none font-medium text-2xl shadow-none outline-none focus-visible:ring-0 dark:bg-transparent'
            onChange={(e) =>
              setAddIssueForm({ ...addIssueForm, title: e.target.value })
            }
            placeholder='Issue title'
            value={addIssueForm.title}
          />

          <Textarea
            className='overflow-wrap min-h-16 w-full resize-none whitespace-normal break-words border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            onChange={(e) =>
              setAddIssueForm({ ...addIssueForm, description: e.target.value })
            }
            placeholder='Add description...'
            value={addIssueForm.description}
          />

          <div className='flex w-full flex-wrap items-center justify-start gap-1.5'>
            <StatusSelector
              onChange={(newStatus) =>
                setAddIssueForm({ ...addIssueForm, statusKey: newStatus })
              }
              statusKey={addIssueForm.statusKey || 'to-do'}
            />
            <PrioritySelector
              onChange={(newPriority) =>
                setAddIssueForm({ ...addIssueForm, priorityKey: newPriority })
              }
              priorityKey={addIssueForm.priorityKey || 'no-priority'}
            />
            <AssigneeSelector
              assigneeId={addIssueForm.assigneeId || undefined}
              onChange={(newAssignee) =>
                setAddIssueForm({ ...addIssueForm, assigneeId: newAssignee })
              }
            />
            <ProjectSelector
              onChange={(newProject) =>
                setAddIssueForm({ ...addIssueForm, project: newProject })
              }
              project={addIssueForm.project}
            />
            <LabelSelector
              onChange={(newLabels) =>
                setAddIssueForm({ ...addIssueForm, tags: newLabels })
              }
              selectedLabels={addIssueForm.tags}
            />
          </div>
        </div>
        <div className='flex w-full items-center justify-between border-t px-4 py-2.5'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center space-x-2'>
              <Switch
                checked={createMore}
                id='create-more'
                onCheckedChange={setCreateMore}
              />
              <Label htmlFor='create-more'>Create more</Label>
            </div>
          </div>
          <Button
            onClick={() => {
              createIssue();
            }}
            size='sm'
          >
            Create issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
