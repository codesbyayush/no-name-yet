import { RiEditLine } from '@remixicon/react';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { Heart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Issue } from '@/mock-data/issues';
import { ranks } from '@/mock-data/issues';
import { priorities } from '@/mock-data/priorities';
import { useBoards } from '@/react-db/boards';
import { useAddIssue } from '@/react-db/issues';
import { useCreateIssueStore } from '@/store/create-issue-store';
import { AssigneeSelector } from './assignee-selector';
import { BoardSelector } from './board-selector';
import { LabelSelector } from './label-selector';
import { PrioritySelector } from './priority-selector';
import { StatusSelector } from './status-selector';

export function CreateNewIssue() {
  const [createMore, setCreateMore] = useState<boolean>(false);
  const { isOpen, defaultStatusKey, openModal, closeModal } =
    useCreateIssueStore();
  const addIssue = useAddIssue();

  const { data: boards } = useBoards();

  const createDefaultData = useCallback(() => {
    return {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      status: defaultStatusKey,
      assigneeId: undefined,
      assignee: null,
      priority: 'no-priority',
      labels: [],
      createdAt: new Date().toISOString(),
      boardId: boards?.filter((b) => b.isSystem)[0]?.id || boards?.[0]?.id,
      rank: ranks.at(-1) ?? ranks[ranks.length - 1] ?? '0',
      tags: [],
    };
  }, [defaultStatusKey]);

  const [addIssueForm, setAddIssueForm] = useState<Issue>(createDefaultData());

  useEffect(() => {
    if (isOpen) {
      if (createDefaultData().boardId === undefined) {
        setAddIssueForm({
          ...createDefaultData(),
          boardId: boards?.filter((b) => b.isSystem)[0]?.id,
        });
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
    if (!addIssueForm.boardId) {
      toast.error('Board is required');
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
            className='wrap-break-word h-auto w-full overflow-hidden text-ellipsis whitespace-normal border-none font-medium text-2xl shadow-none outline-none focus-visible:ring-0 dark:bg-transparent'
            onChange={(e) =>
              setAddIssueForm({ ...addIssueForm, title: e.target.value })
            }
            placeholder='Issue title'
            value={addIssueForm.title}
          />

          <Textarea
            className='overflow-wrap wrap-break-word min-h-16 w-full resize-none whitespace-normal border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            onChange={(e) =>
              setAddIssueForm({ ...addIssueForm, description: e.target.value })
            }
            placeholder='Add description...'
            value={addIssueForm.description}
          />

          <div className='flex w-full flex-wrap items-center justify-start gap-1.5'>
            <StatusSelector
              onChange={(newStatus) =>
                setAddIssueForm({ ...addIssueForm, status: newStatus })
              }
              status={addIssueForm.status || 'to-do'}
            />
            <PrioritySelector
              onChange={(newPriority) =>
                setAddIssueForm({ ...addIssueForm, priority: newPriority })
              }
              priority={addIssueForm.priority}
            />
            <AssigneeSelector
              assigneeId={addIssueForm.assigneeId || undefined}
              onChange={(newAssignee) =>
                setAddIssueForm({ ...addIssueForm, assigneeId: newAssignee })
              }
            />
            <BoardSelector
              onChange={(newBoard) =>
                setAddIssueForm({ ...addIssueForm, boardId: newBoard })
              }
              boardId={addIssueForm.boardId}
            />
            <LabelSelector
              onChange={(newLabels) =>
                setAddIssueForm({ ...addIssueForm, tags: newLabels })
              }
              selectedLabels={addIssueForm.tags || []}
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
