import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Clock, Info, Lightbulb, PlusIcon, Settings, X } from 'lucide-react';
import { useState } from 'react';

interface Status {
  id: string;
  name: string;
  category: string;
  isDefault?: boolean;
  hex?: string;
}

interface StatusCategory {
  id: string;
  name: string;
  statuses: Status[];
}

interface FeedbackBoard {
  id: string;
  name: string;
  icon: string;
}

export function FeedbackSettings() {
  const [statusCategories, setStatusCategories] = useState<StatusCategory[]>([
    {
      id: 'reviewing',
      name: 'Reviewing',
      statuses: [
        {
          id: 'in-review',
          name: 'In Review',
          category: 'reviewing',
          isDefault: true,
          hex: '#42A5F5',
        },
      ],
    },
    {
      id: 'planned',
      name: 'Planned',
      statuses: [
        {
          id: 'planned',
          name: 'Planned',
          category: 'planned',
          hex: '#AB47BC',
        },
      ],
    },
    {
      id: 'active',
      name: 'Active',
      statuses: [
        {
          id: 'in-progress',
          name: 'In Progress',
          category: 'active',
          hex: '#42A5F5',
        },
      ],
    },
    {
      id: 'completed',
      name: 'Completed',
      statuses: [
        {
          id: 'completed',
          name: 'Completed',
          category: 'completed',
          hex: '#8BC34A',
        },
      ],
    },
    {
      id: 'canceled',
      name: 'Canceled',
      statuses: [
        {
          id: 'rejected',
          name: 'Rejected',
          category: 'canceled',
          hex: '#F44336',
        },
      ],
    },
  ]);

  const [hideCompletedCanceled, setHideCompletedCanceled] = useState(false);
  const [hideAllStatuses, setHideAllStatuses] = useState(false);

  // Add Status Dialog state
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(
    null
  );
  const [newStatusName, setNewStatusName] = useState('');
  const colorPalette = [
    '#F44336',
    '#FF9800',
    '#FFC107',
    '#8BC34A',
    '#26A69A',
    '#00BCD4',
    '#42A5F5',
    '#5C6BC0',
    '#AB47BC',
    '#EC407A',
  ];
  const [selectedColor, setSelectedColor] = useState<string>(colorPalette[0]);

  const [feedbackBoards, _setFeedbackBoards] = useState<FeedbackBoard[]>([
    {
      id: 'feature-request',
      name: 'Feature Request',
      icon: 'lightbulb',
    },
  ]);

  const [defaultSorting, setDefaultSorting] = useState('recent-posts');

  // Create Board dialog state
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [boardVisibility, setBoardVisibility] = useState<'public' | 'private'>(
    'public'
  );
  const [boardIcon, setBoardIcon] = useState<{
    emoji: string;
    name: string;
  } | null>(null);

  // Simple, hardcoded emoji list (always visible; no filtering/unused logic)
  const availableEmojis = [
    '💡',
    '🐛',
    '💬',
    '🚀',
    '⭐',
    '🎯',
    '🔧',
    '📊',
    '🎨',
    '🔒',
    '📝',
    '💰',
    '🌟',
    '🏆',
    '🎪',
    '🎭',
    '🔥',
    '⚡',
    '🌈',
    '🎊',
    '🎉',
    '🎀',
    '🎁',
    '🎲',
    '🎸',
    '🎺',
    '🎻',
    '🎤',
  ] as const;

  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);

  const openCreateBoard = () => {
    setBoardName('');
    setBoardDescription('');
    setBoardVisibility('public');
    setBoardIcon(null);
    setCreateBoardOpen(true);
    setShowEmojiDropdown(false);
  };

  const handleCreateBoard = () => {
    if (!boardName.trim()) {
      return;
    }
    const _payload = {
      name: boardName.trim(),
      description: boardDescription.trim() || null,
      visibility: boardVisibility,
      icon: boardIcon, // { emoji, name } | null
    };
    setCreateBoardOpen(false);
  };

  // Empty handlers for future backend integration
  const handleAddStatus = (categoryId: string) => {
    setPendingCategoryId(categoryId);
    setNewStatusName('');
    setSelectedColor(colorPalette[0]);
    setAddStatusOpen(true);
  };

  const handleEditStatus = (_statusId: string) => {
    // TODO: Implement backend integration
  };

  const handleDeleteStatus = (_statusId: string) => {
    // TODO: Implement backend integration
  };

  const handleConfirmAddStatus = () => {
    if (!(pendingCategoryId && newStatusName.trim())) {
      return;
    }
    const id = newStatusName.toLowerCase().replace(/\s+/g, '-');
    setStatusCategories((prev) =>
      prev.map((cat) =>
        cat.id === pendingCategoryId
          ? {
              ...cat,
              statuses: [
                ...cat.statuses,
                {
                  id,
                  name: newStatusName.trim(),
                  category: cat.id,
                  hex: selectedColor,
                },
              ],
            }
          : cat
      )
    );
    setAddStatusOpen(false);
    setPendingCategoryId(null);
  };

  const handleHideCompletedCanceledChange = (checked: boolean) => {
    setHideCompletedCanceled(checked);
    // TODO: Implement backend integration
  };

  const handleHideAllStatusesChange = (checked: boolean) => {
    setHideAllStatuses(checked);
    // TODO: Implement backend integration
  };

  // Feedback module handlers
  const _handleAddBoard = () => {
    // TODO: Implement backend integration
  };

  const handleEditBoard = (_boardId: string) => {
    // TODO: Implement backend integration
  };

  const handleDeleteBoard = (_boardId: string) => {
    // TODO: Implement backend integration
  };

  const handleBoardInfo = (_boardId: string) => {
    // TODO: Implement backend integration
  };

  const handleDefaultSortingChange = (value: string) => {
    setDefaultSorting(value);
    // TODO: Implement backend integration
  };

  return (
    <div className='space-y-8'>
      {/* Feedback Module Section */}
      <Card className='border border-muted-foreground/10 bg-card'>
        <CardHeader>
          <CardTitle>Feedback module</CardTitle>
          <CardDescription>
            Reorder, customize or remove links (modules) from being displayed
            from public portal or widgets.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div />
            <Button className='bg-primary' onClick={openCreateBoard}>
              <PlusIcon className='mr-2 h-4 w-4' />
              Add board
            </Button>
          </div>

          <div className='space-y-3'>
            {feedbackBoards.map((board) => (
              <div
                className='flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/20 p-4'
                key={board.id}
              >
                <div className='flex items-center space-x-3'>
                  <Lightbulb className='h-5 w-5 text-yellow-500' />
                  <span className='font-medium'>{board.name}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    className='h-8 w-8 p-0'
                    onClick={() => handleBoardInfo(board.id)}
                    size='sm'
                    variant='ghost'
                  >
                    <Info className='h-4 w-4' />
                  </Button>
                  <Button
                    className='h-8 px-3'
                    onClick={() => handleEditBoard(board.id)}
                    size='sm'
                    variant='ghost'
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    Edit
                  </Button>
                  <Button
                    className='h-8 px-3 text-destructive hover:text-destructive'
                    onClick={() => handleDeleteBoard(board.id)}
                    size='sm'
                    variant='ghost'
                  >
                    <X className='mr-2 h-4 w-4' />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className='space-y-3'>
            <Label className='font-medium'>Default sorting</Label>
            <Select
              onValueChange={handleDefaultSortingChange}
              value={defaultSorting}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='recent-posts'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4' />
                    <span>Recent posts</span>
                  </div>
                </SelectItem>
                <SelectItem value='most-voted'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4' />
                    <span>Most voted</span>
                  </div>
                </SelectItem>
                <SelectItem value='oldest-first'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4' />
                    <span>Oldest first</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Board Dialog */}
      <Dialog onOpenChange={setCreateBoardOpen} open={createBoardOpen}>
        <DialogContent className='rounded-2xl border-muted-foreground/10 bg-card sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Create new board</DialogTitle>
            <DialogDescription>
              Edit the name and settings of this board.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm'>Icon & name</Label>
              <div className='relative flex items-center gap-3'>
                <button
                  aria-label='Choose icon'
                  className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-xl'
                  onClick={() => setShowEmojiDropdown((v) => !v)}
                  title={boardIcon?.name ?? 'Choose icon'}
                  type='button'
                >
                  {boardIcon?.emoji ?? '🙂'}
                </button>
                <input
                  className='h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder='Feature Request'
                  value={boardName}
                />
                {showEmojiDropdown && (
                  <div className='absolute top-12 left-0 z-50 w-[260px] rounded-md border border-border bg-card p-2 shadow-xl'>
                    <div className='grid grid-cols-8 gap-2'>
                      {availableEmojis.map((emoji) => (
                        <button
                          aria-label={`Select ${emoji}`}
                          className={`aspect-square w-full rounded-md border border-transparent bg-muted/40 text-lg leading-none transition hover:bg-muted ${boardIcon?.emoji === emoji ? 'ring-2 ring-primary' : ''}`}
                          key={emoji}
                          onClick={() => {
                            setBoardIcon({ emoji, name: 'emoji' });
                            setShowEmojiDropdown(false);
                          }}
                          title={`${emoji}`}
                          type='button'
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm'>Description</Label>
              <textarea
                className='min-h-[72px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'
                onChange={(e) => setBoardDescription(e.target.value)}
                placeholder='Describe what this board is for…'
                value={boardDescription}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-sm'>Visibility</Label>
              <div className='flex gap-2'>
                <Button
                  className='flex-1'
                  onClick={() => setBoardVisibility('public')}
                  type='button'
                  variant={
                    boardVisibility === 'public' ? 'default' : 'secondary'
                  }
                >
                  Public
                </Button>
                <Button
                  className='flex-1'
                  onClick={() => setBoardVisibility('private')}
                  type='button'
                  variant={
                    boardVisibility === 'private' ? 'default' : 'secondary'
                  }
                >
                  Private
                </Button>
              </div>
            </div>

            {/* Icon picker is now in a dropdown next to the name input */}
          </div>

          <DialogFooter className='mt-2'>
            <Button onClick={() => setCreateBoardOpen(false)} variant='ghost'>
              Cancel
            </Button>
            <Button
              className='bg-primary'
              disabled={!boardName.trim()}
              onClick={handleCreateBoard}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statuses Section */}
      <Card className='border border-muted-foreground/10 bg-card'>
        <CardHeader>
          <CardTitle>Statuses</CardTitle>
          <CardDescription>
            Customize existing ones or add extra statuses you can add for posts.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {statusCategories.map((category) => (
            <div className='space-y-4' key={category.id}>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-lg'>{category.name}</h3>
                <Button
                  className='h-8 px-3'
                  onClick={() => handleAddStatus(category.id)}
                  size='sm'
                  variant='outline'
                >
                  <PlusIcon className='h-4 w-4' />
                </Button>
              </div>
              <div className='space-y-2'>
                {category.statuses.map((status) => (
                  <div
                    className='flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/20 p-3'
                    key={status.id}
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className='h-3 w-3 rounded-full'
                        style={{ backgroundColor: status.hex ?? '#9E9E9E' }}
                      />
                      <span className='font-medium'>{status.name}</span>
                      {status.isDefault && (
                        <Badge className='text-xs' variant='secondary'>
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        className='h-8 w-8 p-0'
                        onClick={() => handleEditStatus(status.id)}
                        size='sm'
                        variant='ghost'
                      >
                        <Settings className='h-4 w-4' />
                      </Button>
                      <Button
                        className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                        onClick={() => handleDeleteStatus(status.id)}
                        size='sm'
                        variant='ghost'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Add Status Dialog */}
          <Dialog onOpenChange={setAddStatusOpen} open={addStatusOpen}>
            <DialogContent className='rounded-2xl border-muted-foreground/10 bg-card'>
              <DialogHeader>
                <DialogTitle>Add Status</DialogTitle>
                <DialogDescription>
                  Enter a name for your new status and choose a color.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm'>Name</Label>
                  <input
                    className='h-10 w-full rounded-md border border-muted-foreground/20 bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    onChange={(e) => setNewStatusName(e.target.value)}
                    placeholder='Next Release'
                    value={newStatusName}
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm'>Choose color</Label>
                  <div className='grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'>
                    {colorPalette.map((hex) => (
                      <button
                        aria-label={`Select color ${hex}`}
                        className={`aspect-square w-full rounded-md ring-offset-background transition-shadow focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${selectedColor === hex ? 'ring-2 ring-primary' : 'ring-0'}`}
                        key={hex}
                        onClick={() => setSelectedColor(hex)}
                        style={{ backgroundColor: hex }}
                        type='button'
                      />
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  className='h-9'
                  onClick={() => setAddStatusOpen(false)}
                  variant='ghost'
                >
                  Cancel
                </Button>
                <Button
                  className='h-9 bg-primary'
                  disabled={!newStatusName.trim()}
                  onClick={handleConfirmAddStatus}
                >
                  Add Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Hiding Options Section */}
      <Card className='border border-muted-foreground/10 bg-card'>
        <CardHeader>
          <CardTitle>Hiding Options</CardTitle>
          <CardDescription>
            Configure visibility settings for your feedback board.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-start space-x-3'>
            <Checkbox
              checked={hideCompletedCanceled}
              id='hide-completed-canceled'
              onCheckedChange={handleHideCompletedCanceledChange}
            />
            <div className='space-y-1'>
              <Label
                className='font-medium text-sm'
                htmlFor='hide-completed-canceled'
              >
                Hide completed and canceled posts from feedback board
              </Label>
              <p className='text-muted-foreground text-sm'>
                By default completed and canceled posts are shown on the
                feedback board. You can hide them to keep your feedback board
                clean.
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-3'>
            <Checkbox
              checked={hideAllStatuses}
              id='hide-all-statuses'
              onCheckedChange={handleHideAllStatusesChange}
            />
            <div className='space-y-1'>
              <Label
                className='font-medium text-sm'
                htmlFor='hide-all-statuses'
              >
                Hide all statuses from public feedback board
              </Label>
              <p className='text-muted-foreground text-sm'>
                By default users will be able to see statuses of posts on the
                feedback board. Check this option to hide all statuses from the
                public feedback board.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
