import { type InfiniteData, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
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
import { Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { client, queryClient } from '@/utils/orpc';
import { BoardSelector } from './board-selector';

const defaultNewIssueForm = {
  title: '',
  description: '',
  boardId: '',
  tags: [],
};

type PostListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  status?: string;
  board?: { id: string; name?: string; slug?: string };
  author?: { name?: string; image?: string | null };
  hasVoted?: boolean;
  commentCount?: number;
  voteCount?: number;
};

type PostsPage = {
  posts: PostListItem[];
  pagination?: unknown;
  [key: string]: unknown;
};

type PostsInfiniteData = InfiniteData<PostsPage>;

export function CreateNewIssue() {
  const [createMore, setCreateMore] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [newIssueForm, setNewIssueForm] = useState(defaultNewIssueForm);

  const { data: session } = useSession();

  const createIssueMutation = useMutation({
    mutationFn: ({
      boardId,
      title,
      description,
    }: {
      boardId: string;
      title: string;
      description: string;
    }) => client.public.posts.create({ boardId, title, description }),
    onMutate: async (variables) => {
      const { boardId, title, description } = variables;

      const allPostsKeyForBoard: [string, string | undefined] = [
        'all-posts',
        boardId,
      ];
      const allPostsKeyAll: [string, undefined] = ['all-posts', undefined];

      await Promise.all([
        queryClient.cancelQueries({ queryKey: allPostsKeyForBoard }),
        queryClient.cancelQueries({ queryKey: allPostsKeyAll }),
      ]);

      const previousForBoard =
        queryClient.getQueryData<PostsInfiniteData>(allPostsKeyForBoard);
      const previousForAll =
        queryClient.getQueryData<PostsInfiniteData>(allPostsKeyAll);

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticItem: PostListItem = {
        id: optimisticId,
        title,
        content: description,
        createdAt: new Date(),
        status: 'new',
        board: { id: boardId },
        author: { name: 'You', image: null },
        hasVoted: false,
        commentCount: 0,
        voteCount: 0,
      };

      const prependOptimistic = (old?: PostsInfiniteData) => {
        if (!old?.pages) {
          return old;
        }
        return {
          ...old,
          pages: old.pages.map((page, idx) =>
            idx === 0
              ? { ...page, posts: [optimisticItem, ...(page.posts ?? [])] }
              : page
          ),
        } as PostsInfiniteData;
      };

      queryClient.setQueryData<PostsInfiniteData>(
        allPostsKeyForBoard,
        prependOptimistic(previousForBoard)
      );
      queryClient.setQueryData<PostsInfiniteData>(
        allPostsKeyAll,
        prependOptimistic(previousForAll)
      );

      return { previousForBoard, previousForAll, optimisticId, boardId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousForBoard) {
        queryClient.setQueryData(
          ['all-posts', context.boardId],
          context.previousForBoard
        );
      }
      if (context?.previousForAll) {
        queryClient.setQueryData(
          ['all-posts', undefined],
          context.previousForAll
        );
      }
      toast.error('Failed to create issue');
    },
    onSuccess: () => {
      toast.success('Issue created');
      if (!createMore) {
        setIsOpen(false);
      }
      setNewIssueForm(defaultNewIssueForm);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['all-posts', variables?.boardId],
      });
      queryClient.invalidateQueries({ queryKey: ['all-posts', undefined] });
    },
  });

  const navigate = useNavigate();

  const createIssue = () => {
    if (session?.user.isAnonymous) {
      return navigate({ to: '/auth', search: { redirect: '/board' } });
    }
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
    createIssueMutation.mutate({
      boardId: newIssueForm.boardId,
      title: newIssueForm.title,
      description: newIssueForm.description,
    });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className='size-8 shrink-0' size='icon' variant='secondary'>
          <Plus />
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
              setNewIssueForm({ ...newIssueForm, title: e.target.value })
            }
            placeholder='Issue title'
            value={newIssueForm.title}
          />

          <Textarea
            className='overflow-wrap min-h-16 w-full resize-none whitespace-normal break-words border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            onChange={(e) =>
              setNewIssueForm({ ...newIssueForm, description: e.target.value })
            }
            placeholder='Add description...'
            value={newIssueForm.description}
          />

          <div className='flex w-full flex-wrap items-center justify-start gap-1.5'>
            <BoardSelector
              board={newIssueForm.boardId}
              onChange={(newProject: string) =>
                setNewIssueForm({ ...newIssueForm, boardId: newProject })
              }
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
            disabled={createIssueMutation.isPending}
            onClick={() => {
              createIssue();
            }}
            size='sm'
          >
            {session?.user.isAnonymous
              ? 'Sign in to create issue'
              : createIssueMutation.isPending
                ? 'Creating…'
                : 'Create issue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
