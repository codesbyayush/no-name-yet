import { DialogTitle } from '@radix-ui/react-dialog';
import { RiEditLine } from '@remixicon/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { client } from '@/utils/orpc';
import { BoardSelector } from './board-selector';

const defaultNewIssueForm = {
  title: '',
  description: '',
  boardId: '',
  tags: [],
};

export function CreateNewIssue() {
  const [createMore, setCreateMore] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [newIssueForm, setNewIssueForm] = useState(defaultNewIssueForm);

  const createIssue = async () => {
    if (!newIssueForm.title) {
      toast.error('Title is required');
      return;
    }
    if (!newIssueForm.description) {
      toast.error('Description is required');
      return;
    }
    if (!newIssueForm.boardId) {
      toast.error('Board is required');
      return;
    }
    await client.public.posts.create({
      boardId: newIssueForm.boardId,
      title: newIssueForm.title,
      description: newIssueForm.description,
    });
    toast.success('Issue created');
    if (!createMore) {
      setIsOpen(false);
    }
    setNewIssueForm(defaultNewIssueForm);
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="size-8 shrink-0" size="icon" variant="secondary">
          <RiEditLine />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[30%] w-full p-0 shadow-xl sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2 px-4 pt-4">
              <Button className="gap-1.5" size="sm" variant="outline">
                <Heart className="size-4 fill-orange-500 text-orange-500" />
                <span className="font-medium capitalize">new issue</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="w-full space-y-3 px-4 pb-0">
          <Input
            className="h-auto w-full overflow-hidden text-ellipsis whitespace-normal break-words border-none px-0 font-medium text-2xl shadow-none outline-none focus-visible:ring-0"
            onChange={(e) =>
              setNewIssueForm({ ...newIssueForm, title: e.target.value })
            }
            placeholder="Issue title"
            value={newIssueForm.title}
          />

          <Textarea
            className="overflow-wrap min-h-16 w-full resize-none whitespace-normal break-words border-none px-0 shadow-none outline-none focus-visible:ring-0"
            onChange={(e) =>
              setNewIssueForm({ ...newIssueForm, description: e.target.value })
            }
            placeholder="Add description..."
            value={newIssueForm.description}
          />

          <div className="flex w-full flex-wrap items-center justify-start gap-1.5">
            <BoardSelector
              board={newIssueForm.boardId}
              onChange={(newProject: string) =>
                setNewIssueForm({ ...newIssueForm, boardId: newProject })
              }
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-between border-t px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={createMore}
                id="create-more"
                onCheckedChange={setCreateMore}
              />
              <Label htmlFor="create-more">Create more</Label>
            </div>
          </div>
          <Button
            onClick={() => {
              createIssue();
            }}
            size="sm"
          >
            Create issue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
