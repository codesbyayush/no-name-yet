import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { set } from "react-hook-form";

interface PostFormData {
  title: string;
  description: string;
  board: string;
}

interface CreateEditPostProps {
  boardId: string;
  trigger?: React.ReactNode;
  post?: any; // Existing post for editing
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export function CreateEditPost({
  boardId,
  trigger,
  post,
  mode = "create",
  onSuccess,
}: CreateEditPostProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    description: "",
    board: "",
  });

  // Pre-fill form data when editing
  useEffect(() => {
    if (post && mode === "edit") {
      setFormData({
        title: post.title || "",
        description: post.description || "",
        board: post.boardId,
      });
    }
  }, [post, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open && mode === "create") {
      setFormData({
        title: "",
        description: "",
        board: boards?.boards[0].id || "",
      });
      setNewTag("");
    }
  }, [open, mode]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: PostFormData) =>
      client.public.posts.create({
        boardId,
        type: "suggestion",
        ...data,
      }),
    onSuccess: () => {
      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["boardPosts", boardId] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const { data: boards } = useQuery({
    queryKey: ["public-boards"],
    queryFn: () => client.getAllPublicBoards(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (mode === "create") {
      createPostMutation.mutate(formData);
    } else {
      // TODO: Handle edit mode when update mutation is available
      toast.error("Edit functionality not yet implemented");
    }
  };

  const isLoading = createPostMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full rounded-xl bg-primary">
            {mode === "create" ? "Submit a post" : "Edit post"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] w-11/12 max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Share your feedback, suggestion, or report a bug."
              : "Update your post details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter post title..."
              maxLength={250}
              required
            />
            {
              <div
                className={`text-xs ${formData.title.length > 150 ? "text-muted-foreground" : "text-transparent"}`}
              >
                {formData.title.length}/250 characters
              </div>
            }
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <AutosizeTextarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your feedback in detail..."
              maxLength={5000}
              minHeight={100}
              required
            />
            <div
              className={`text-xs ${formData.description.length > 5000 ? "text-muted-foreground" : "text-transparent"}`}
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

        <DialogFooter>
          <div className="gap-4 w-full">
            <div className="space-y-2 w-full">
              <Select
                value={formData.board}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, board: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {boards?.boards.map((board) => (
                    <SelectItem value={board.id}>{board.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
            disabled={
              isLoading ||
              !formData.title.trim() ||
              !formData.description.trim()
            }
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Post"
            ) : (
              "Update Post"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
