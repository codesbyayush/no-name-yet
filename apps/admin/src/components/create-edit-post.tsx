import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { client } from '@/utils/orpc';

interface PostFormData {
  title: string;
  description: string;
  board: string;
}

interface CreateEditPostProps {
  boardId: string;
  trigger?: React.ReactNode;
  post?: any; // Existing post for editing
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export function CreateEditPost({
  boardId,
  trigger,
  post,
  mode = 'create',
  onSuccess,
}: CreateEditPostProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [_newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    board: '',
  });

  // Pre-fill form data when editing
  useEffect(() => {
    if (post && mode === 'edit') {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        board: post.boardId,
      });
    }
  }, [post, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open && mode === 'create') {
      setFormData({
        title: '',
        description: '',
        board: boards?.boards[0].id || '',
      });
      setNewTag('');
    }
  }, [open, mode, boards?.boards[0].id]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      client.public.posts.create({
        boardId,
        type: 'suggestion',
        ...data,
      }),
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const { data: boards } = useQuery({
    queryKey: ['public-boards'],
    queryFn: () => client.getAllPublicBoards(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (mode === 'create') {
      createPostMutation.mutate(formData);
    } else {
      // TODO: Handle edit mode when update mutation is available
      toast.error('Edit functionality not yet implemented');
    }
  };

  const isLoading = createPostMutation.isPending;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-10 w-full rounded-xl bg-primary p-0 font-medium text-base shadow-sm hover:bg-primary/90">
            {mode === 'create' ? 'Submit a post' : 'Edit post'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-11/12 overflow-y-auto rounded-3xl border-muted-foreground/10 bg-gradient-to-bl from-card-foreground/5 to-card shadow-xl backdrop-blur-3xl sm:max-w-[600px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-semibold text-2xl text-card-foreground">
            {mode === 'create' ? 'Create New Post' : 'Edit Post'}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {mode === 'create'
              ? 'Share your feedback, suggestion, or report a bug.'
              : 'Update your post details.'}
          </DialogDescription>
        </DialogHeader>

        <form className="pt-2" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="space-y-3">
            <Label
              className="font-medium text-base text-card-foreground"
              htmlFor="title"
            >
              Title *
            </Label>
            <Input
              className="!bg-muted h-12 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="title"
              maxLength={250}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter post title..."
              required
              value={formData.title}
            />
            <div
              className={`text-right text-xs ${formData.title.length > 200 ? 'text-destructive' : formData.title.length > 150 ? 'text-yellow-600' : 'text-muted-foreground'}`}
            >
              {formData.title.length}/250 characters
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label
              className="font-medium text-base text-card-foreground"
              htmlFor="description"
            >
              Description *
            </Label>
            <AutosizeTextarea
              className="!bg-muted rounded-xl border-muted-foreground/20 px-4 py-3 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="description"
              maxLength={5000}
              minHeight={120}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your feedback in detail..."
              required
              value={formData.description}
            />
            <div
              className={`text-right text-xs ${formData.description.length > 4500 ? 'text-destructive' : formData.description.length > 3500 ? 'text-yellow-600' : 'text-muted-foreground'}`}
            >
              {formData.description.length}/5000 characters
            </div>
          </div>

          {/* Tags */}
          {/* <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={
                  !newTag.trim() || formData.tags.includes(newTag.trim())
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div> */}
        </form>

        <div>
          <div className="space-y-3">
            <Label
              className="font-medium text-base text-card-foreground"
              htmlFor="board"
            >
              Board
            </Label>
            <Select
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, board: value }))
              }
              value={formData.board}
            >
              <SelectTrigger className="!bg-muted hover:!bg-muted focus:!bg-muted h-12 rounded-lg border-muted-foreground/20 p-2 px-4 text-base text-foreground capitalize">
                <SelectValue
                  className="text-foreground"
                  placeholder="Select board"
                />
              </SelectTrigger>
              <SelectContent className="!bg-muted rounded-sm border-muted-foreground/10 shadow-xl">
                {boards?.boards.map((board) => (
                  <SelectItem
                    className="cursor-pointer rounded-xs text-base"
                    key={board.id}
                    value={board.id}
                  >
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            className="h-12 rounded-xl border-muted-foreground/20 bg-background px-6 text-base text-foreground hover:bg-muted/50"
            disabled={isLoading}
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="h-12 rounded-xl bg-primary px-8 text-base shadow-lg hover:bg-primary/90"
            disabled={
              isLoading ||
              !formData.title.trim() ||
              !formData.description.trim()
            }
            onClick={handleSubmit}
            type="submit"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Create Post'
            ) : (
              'Update Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
