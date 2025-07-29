import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminClient } from "@/utils/admin-orpc";
import { client, queryClient } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Board {
  id: string;
  name: string;
  symbol: string | null;
  isPrivate: boolean | null;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export function BoardsSettings() {
  const [allowGuestSubmissions, setAllowGuestSubmissions] = useState(false);

  // Fetch boards from the server
  const { data: boardsData, isLoading: boardsLoading } = useQuery({
    queryKey: ["admin-boards"],
    queryFn: () => adminClient.organization.boardsRouter.getAll(),
  });

  // Fetch tags from the server
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => adminClient.organization.tagsRouter.getAll(),
  });

  const boards = boardsData || [];
  const tags = tagsData || [];

  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardEmoji, setNewBoardEmoji] = useState("");
  const [newBoardIsPrivate, setNewBoardIsPrivate] = useState(false);
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");

  const availableEmojis = [
    "💡",
    "🐛",
    "💬",
    "🚀",
    "⭐",
    "🎯",
    "🔧",
    "📊",
    "🎨",
    "🔒",
    "📝",
    "💰",
    "🌟",
    "🏆",
    "🎪",
    "🎭",
    "🎨",
    "🎯",
    "🔥",
    "⚡",
    "🌈",
    "🎊",
    "🎉",
    "🎀",
    "🎁",
    "🎲",
    "🎸",
    "🎺",
    "🎻",
    "🎤",
  ];

  const usedEmojis = boards.map((board) => board.symbol).filter(Boolean);
  const firstAvailableEmoji =
    availableEmojis.find((emoji) => !usedEmojis.includes(emoji)) ||
    availableEmojis[0];

  // Set default emoji to first available when component mounts or boards change
  useEffect(() => {
    if (!newBoardEmoji) {
      setNewBoardEmoji(firstAvailableEmoji);
    }
  }, [boards, firstAvailableEmoji, newBoardEmoji]);

  const createBoardMutation = useMutation({
    mutationFn: (data: { name: string; emoji: string; isPrivate: boolean }) =>
      adminClient.organization.boardsRouter.create({
        ...data,
        slug: data.name.split(" ").join("-").toLowerCase(),
      }),
    onSuccess: () => {
      toast.success("Board created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-boards"] });
      setNewBoardName("");
      setNewBoardEmoji(firstAvailableEmoji);
      setNewBoardIsPrivate(false);
      setShowEmojiDropdown(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create board");
    },
  });

  const createBoard = () => {
    createBoardMutation.mutate({
      name: newBoardName.trim(),
      emoji: newBoardEmoji,
      isPrivate: newBoardIsPrivate,
    });
  };

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      adminClient.organization.tagsRouter.create(data),
    onSuccess: () => {
      toast.success("Tag created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      setNewTagName("");
      setNewTagColor("blue");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create tag");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) =>
      adminClient.organization.tagsRouter.delete({ id: tagId }),
    onSuccess: () => {
      toast.success("Tag deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete tag");
    },
  });

  const createTag = () => {
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
    });
  };

  const deleteTag = (tagId: string) => {
    deleteTagMutation.mutate(tagId);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      red: "bg-red-100 text-red-800 border-red-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="space-y-8">
      {/* Guest Submissions Section */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <CardTitle>Allow Guest Submissions</CardTitle>
          <CardDescription>
            Guest access is only available on our paid plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="guest-submissions">
                Enable guest submissions
              </Label>
              <p className="text-muted-foreground text-sm">
                Allow users to submit feedback without creating an account.
              </p>
            </div>
            <Switch
              id="guest-submissions"
              checked={allowGuestSubmissions}
              onCheckedChange={setAllowGuestSubmissions}
              disabled={!allowGuestSubmissions} // Simulate paid feature
            />
          </div>
        </CardContent>
      </Card>

      {/* Manage Boards Section */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <CardTitle>Manage Boards</CardTitle>
          <CardDescription>
            Boards are the main way to organize your feedback. They are buckets
            that contain all of the feedback for a specific product or feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 border-none">
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boardsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    Loading boards...
                  </TableCell>
                </TableRow>
              ) : boards.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No boards found. Create your first board below.
                  </TableCell>
                </TableRow>
              ) : (
                boards.map((board) => (
                  <TableRow key={board.id} className="border-b-0">
                    <TableCell className="text-xl">
                      {board.symbol || "📋"}
                    </TableCell>
                    <TableCell className="font-medium">{board.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={board.isPrivate ? "secondary" : "default"}
                      >
                        {board.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 border-muted-foreground/10 border-t pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmojiDropdown(!showEmojiDropdown)}
                    className="h-10 w-16 p-0 text-xl"
                  >
                    {newBoardEmoji}
                  </Button>
                  {showEmojiDropdown && (
                    <div className="absolute top-12 left-0 z-10 grid w-48 grid-cols-6 gap-1 rounded-md border border-border bg-card p-2 shadow-lg">
                      {availableEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewBoardEmoji(emoji);
                            setShowEmojiDropdown(false);
                          }}
                          disabled={usedEmojis.includes(emoji)}
                          className={`h-8 w-8 rounded text-xl hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 ${
                            usedEmojis.includes(emoji) ? "bg-muted" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  placeholder="Board name"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="private-toggle" className="text-sm">
                    Private
                  </Label>
                  <Switch
                    id="private-toggle"
                    checked={newBoardIsPrivate}
                    onCheckedChange={setNewBoardIsPrivate}
                  />
                </div>
                <Button
                  onClick={createBoard}
                  disabled={!newBoardName.trim() || !newBoardEmoji}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Board
                </Button>
              </div>
              {(!newBoardEmoji || !newBoardName.trim()) && (
                <p className="text-muted-foreground text-sm">
                  Please select a symbol and enter a board name to continue.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manage Tags Section */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <CardTitle>Manage Tags</CardTitle>
          <CardDescription>
            Tags are additional labels that can be added to feedback. They are
            useful for categorizing feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tagsLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading tags...
            </div>
          ) : tags.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tags found. Create your first tag below.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="group relative">
                  <Badge
                    variant="outline"
                    className={`${getColorClasses(tag.color)} relative border transition-all hover:pr-6`}
                  >
                    {tag.name}
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="-translate-y-1/2 absolute top-1/2 right-1 cursor-pointer rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border-muted-foreground/10 border-t pt-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="gray">Gray</option>
                  <option value="pink">Pink</option>
                  <option value="yellow">Yellow</option>
                </select>
                <Button onClick={createTag} disabled={!newTagName.trim()}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
              </div>
              {!newTagName.trim() && (
                <p className="text-muted-foreground text-sm">
                  Please enter a tag name to continue.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
