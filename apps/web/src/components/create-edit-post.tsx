import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PostFormData {
  title: string;
  description: string;
  type: 'bug' | 'suggestion';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  isAnonymous: boolean;
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
  onSuccess 
}: CreateEditPostProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    type: 'suggestion',
    priority: 'medium',
    tags: [],
    isAnonymous: false,
    board: ''
  });

  // Pre-fill form data when editing
  useEffect(() => {
    if (post && mode === 'edit') {
      setFormData({
        title: post.title || '',
        description: post.description || '',
        type: post.type || 'suggestion',
        priority: post.priority || 'medium',
        tags: post.tags || [],
        isAnonymous: post.isAnonymous || false,
        board: post.boardId
      });
    }
  }, [post, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open && mode === 'create') {
      setFormData({
        title: '',
        description: '',
        type: 'suggestion',
        priority: 'medium',
        tags: [],
        isAnonymous: false,
        board: boards?.boards[0].id || ''
      });
      setNewTag('');
    }
  }, [open, mode]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) => 
      client.createPost({
        boardId,
        ...data,
        attachments: []
      }),
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    }
  });

  // TODO: Add update post mutation when the RPC function is available
  // const updatePostMutation = useMutation({
  //   mutationFn: (data: PostFormData) => 
  //     client.updatePost({
  //       postId: post.id,
  //       ...data
  //     }),
  //   onSuccess: () => {
  //     toast.success('Post updated successfully!');
  //     queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] });
  //     setOpen(false);
  //     onSuccess?.();
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.message || 'Failed to update post');
  //   }
  // });

    const { data: boards } = useQuery({
        queryKey: ["public-boards"],
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const isLoading = createPostMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className='w-full rounded-xl bg-primary'>
            {mode === 'create' ? 'Submit a post' : 'Edit post'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Post' : 'Edit Post'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Share your feedback, suggestion, or report a bug.'
              : 'Update your post details.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter post title..."
              maxLength={200}
              required
            />
            <div className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <AutosizeTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your feedback in detail..."
              maxLength={5000}
              minHeight={100}
              required
            />
            <div className="text-xs text-muted-foreground">
              {formData.description.length}/5000 characters
            </div>
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'bug' | 'suggestion') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                  <SelectItem value="bug">🐛 Bug Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Board *</Label>
              <Select 
                value={formData.board} 
                onValueChange={(value: string) => 
                  setFormData(prev => ({ ...prev, board: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                    {
                        boards?.boards.map(board => (
                            <SelectItem value={board.id}>
                                {board.name}
                            </SelectItem>
                        ))
                    }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
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
                disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
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
          </div>

          {/* Anonymous posting */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="anonymous" className="text-sm">
              Post anonymously
            </Label>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? 'Create Post' : 'Update Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
