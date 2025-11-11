import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@workspace/ui/components/context-menu';
import {
  AlarmClock,
  ArrowRightLeft,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  Clipboard,
  Clock,
  Copy as CopyIcon,
  FileText,
  Flag,
  Folder,
  Link as LinkIcon,
  MessageSquare,
  Pencil,
  PlusSquare,
  Repeat2,
  Star,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { pickIconForId } from '@/features/issues/utils/get-random-icons';
import { priorities } from '@/mock-data/priorities';
import { status } from '@/mock-data/status';
import { useBoards } from '@/react-db/boards';
import { type IssueDoc, useIssueById, useUpdateIssue } from '@/react-db/issues';
import { useTags } from '@/react-db/tags';
import { useUsers } from '@/react-db/users';

interface IssueContextMenuProps {
  issueId?: string;
}

export function IssueContextMenu({ issueId }: IssueContextMenuProps) {
  const { data: issueData } = useIssueById(issueId);
  const issue = issueData?.[0];
  const { data: tags } = useTags();
  const { data: boards } = useBoards();
  const { data: users } = useUsers();
  const { mutate: issueUpdateMutation } = useUpdateIssue();

  const boardWithIcon = boards?.map((board) => ({
    ...board,
    icon: pickIconForId(board.id),
  }));
  const updateIssue = (updated: Partial<IssueDoc>) => {
    if (!issueId) {
      return;
    }
    issueUpdateMutation(issueId, updated);
  };

  const handleStatusChange = (statusId: string) => {
    const newStatus = status.find((s) => s.id === statusId);
    if (newStatus) {
      updateIssue({ status: newStatus.key });
      toast.success(`Status updated to ${newStatus.name}`);
    }
  };

  const handlePriorityChange = (priorityId: string) => {
    const newPriority = priorities.find((p) => p.id === priorityId);
    if (newPriority) {
      updateIssue({ priority: priorityId });
      toast.success(`Priority updated to ${newPriority.name}`);
    }
  };

  const handleAssigneeChange = (userId: string | null) => {
    const newAssignee = userId
      ? users.find((u) => u.id === userId) || null
      : null;
    updateIssue({ assigneeId: newAssignee?.id ?? null });
    toast.success(
      newAssignee ? `Assigned to ${newAssignee.name}` : 'Unassigned',
    );
  };

  const handleLabelToggle = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);

    if (!tag) {
      return;
    }

    const hasTag = issue?.tags?.includes(tagId);

    if (hasTag) {
      updateIssue({ tags: issue?.tags?.filter((t) => t !== tagId) || [] });
      toast.success(`Removed tag: ${tag.name}`);
    } else {
      updateIssue({ tags: [...(issue?.tags || []), tagId] });
      toast.success(`Added tag: ${tag.name}`);
    }
  };

  const handleBoardChange = (boardId: string) => {
    const newBoard = boards.find((b) => b.id === boardId);
    updateIssue({ boardId: boardId });
    toast.success(`Board set to ${newBoard?.name}`);
  };

  // const handleSetDueDate = () => {
  // const dueDate = new Date();
  // dueDate.setDate(dueDate.getDate() + 7);
  // updateIssue({ dueDate: new Date(dueDate).toISOString() });
  // toast.success('Due date set to 7 days from now');
  // };
  //
  // const handleAddLink = () => {
  // toast.success('Link added');
  // };
  //
  // const handleMakeCopy = () => {
  // toast.success('Issue copied');
  // };

  return (
    <ContextMenuContent className='w-64'>
      <ContextMenuGroup>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <CircleCheck className='mr-2 size-4' /> Status
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-48'>
            {status.map((s) => {
              const Icon = s.icon;
              return (
                <ContextMenuItem
                  key={s.id}
                  onClick={() => handleStatusChange(s.id)}
                >
                  <Icon /> {s.name}
                </ContextMenuItem>
              );
            })}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <User className='mr-2 size-4' /> Assignee
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-48'>
            <ContextMenuItem onClick={() => handleAssigneeChange(null)}>
              <User className='size-4' /> Unassigned
            </ContextMenuItem>
            {users.map((user) => (
              <ContextMenuItem
                key={user.id}
                onClick={() => handleAssigneeChange(user.id)}
              >
                <Avatar className='size-4'>
                  <AvatarImage alt={user.name} src={user.image || ''} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                {user.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <BarChart3 className='mr-2 size-4' /> Priority
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-48'>
            {priorities.map((priority) => (
              <ContextMenuItem
                key={priority.id}
                onClick={() => handlePriorityChange(priority.id)}
              >
                <priority.icon className='size-4' /> {priority.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Tag className='mr-2 size-4' /> Tags
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-48'>
            {tags.map((tag) => (
              <ContextMenuItem
                key={tag.id}
                onClick={() => handleLabelToggle(tag.id)}
              >
                <span
                  aria-hidden='true'
                  className='inline-block size-3 rounded-full'
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Folder className='mr-2 size-4' /> Board
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-64'>
            {boardWithIcon?.slice(0, 5).map((board) => (
              <ContextMenuItem
                key={board.id}
                onClick={() => handleBoardChange(board.id)}
              >
                <board.icon className='size-4' /> {board.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        {/* 
        <ContextMenuItem onClick={handleSetDueDate}>
          <CalendarClock className='size-4' /> Set due date...
          <ContextMenuShortcut>D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem>
          <Pencil className='size-4' /> Rename...
          <ContextMenuShortcut>R</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleAddLink}>
          <LinkIcon className='size-4' /> Add link...
          <ContextMenuShortcut>Ctrl L</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Repeat2 className='mr-2 size-4' /> Convert into
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-48'>
            <ContextMenuItem>
              <FileText className='size-4' /> Document
            </ContextMenuItem>
            <ContextMenuItem>
              <MessageSquare className='size-4' /> Comment
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={handleMakeCopy}>
          <CopyIcon className='size-4' /> Make a copy...
        </ContextMenuItem> */}
      </ContextMenuGroup>
      {/* <ExtraActions issue={issue} issueId={issueId} /> */}
    </ContextMenuContent>
  );
}

const _ExtraActions = ({
  issue,
  issueId,
}: {
  issue: IssueDoc;
  issueId: string;
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCreateRelated = () => {
    toast.success('Related issue created');
  };

  const handleMarkAs = (type: string) => {
    toast.success(`Marked as ${type}`);
  };

  const handleMove = () => {
    toast.success('Issue moved');
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    toast.success(
      isSubscribed ? 'Unsubscribed from issue' : 'Subscribed to issue',
    );
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleCopy = () => {
    if (!issueId) {
      return;
    }
    if (issue) {
      navigator.clipboard.writeText(issue.title);
      toast.success('Copied to clipboard');
    }
  };

  const handleRemindMe = () => {
    toast.success('Reminder set');
  };

  return (
    <>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={handleCreateRelated}>
        <PlusSquare className='size-4' /> Create related
      </ContextMenuItem>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Flag className='mr-2 size-4' /> Mark as
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className='w-48'>
          <ContextMenuItem onClick={() => handleMarkAs('Completed')}>
            <CheckCircle2 className='size-4' /> Completed
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleMarkAs('Duplicate')}>
            <CopyIcon className='size-4' /> Duplicate
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleMarkAs("Won't Fix")}>
            <Clock className='size-4' /> Won&apos;t Fix
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuItem onClick={handleMove}>
        <ArrowRightLeft className='size-4' /> Move
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={handleSubscribe}>
        <Bell className='size-4' /> {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        <ContextMenuShortcut>S</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuItem onClick={handleFavorite}>
        <Star className='size-4' /> {isFavorite ? 'Unfavorite' : 'Favorite'}
        <ContextMenuShortcut>F</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuItem onClick={handleCopy}>
        <Clipboard className='size-4' /> Copy
      </ContextMenuItem>

      <ContextMenuItem onClick={handleRemindMe}>
        <AlarmClock className='size-4' /> Remind me
        <ContextMenuShortcut>H</ContextMenuShortcut>
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem variant='destructive'>
        <Trash2 className='size-4' /> Delete...
        <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
      </ContextMenuItem>
    </>
  );
};
