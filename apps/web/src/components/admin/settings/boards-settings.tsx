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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client, queryClient } from "@/utils/orpc";
import { adminClient } from "@/utils/admin-orpc";
import { useMutation } from "@tanstack/react-query";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Board {
  id: string;
  name: string;
  emoji: string;
  isPrivate: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export function BoardsSettings() {
  const [allowGuestSubmissions, setAllowGuestSubmissions] = useState(false);
  const [boards, setBoards] = useState<Board[]>([
    { id: "1", name: "Feature Requests", emoji: "💡", isPrivate: false },
    { id: "2", name: "Bug Reports", emoji: "🐛", isPrivate: false },
    { id: "3", name: "General Feedback", emoji: "💬", isPrivate: false },
  ]);

  const [tags, setTags] = useState<Tag[]>([
    { id: "1", name: "accessibility", color: "blue" },
    { id: "2", name: "security", color: "red" },
    { id: "3", name: "support", color: "green" },
    { id: "4", name: "design/ui", color: "purple" },
    { id: "5", name: "integration", color: "orange" },
    { id: "6", name: "status", color: "gray" },
    { id: "7", name: "tags", color: "pink" },
    { id: "8", name: "labels", color: "yellow" },
  ]);

  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardEmoji, setNewBoardEmoji] = useState("");
  const [newBoardIsPrivate, setNewBoardIsPrivate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);

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

  const usedEmojis = boards.map((board) => board.emoji);
  const firstAvailableEmoji =
    availableEmojis.find((emoji) => !usedEmojis.includes(emoji)) ||
    availableEmojis[0];

  // Set default emoji to first available when component mounts or boards change
  useEffect(() => {
    if (!newBoardEmoji) {
      setNewBoardEmoji(firstAvailableEmoji);
    }
  }, [boards, firstAvailableEmoji, newBoardEmoji]);

  const createPostMutation = useMutation({
    mutationFn: (data: Omit<Board, "id">) =>
      adminClient.organization.boardsRouter.create({
        ...data,
        slug: data.name.split(" ").join("-").toLowerCase(),
      }),
    onSuccess: () => {
      toast.success("Post created successfully!");
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      // addBoardInData();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const createBoard = () => {
    createPostMutation.mutate({
      name: newBoardName.trim(),
      emoji: newBoardEmoji,
      isPrivate: newBoardIsPrivate,
    });
  };

  const addBoard = () => {
    if (newBoardName.trim() && newBoardEmoji) {
      const newBoard: Board = {
        id: Date.now().toString(),
        name: newBoardName.trim(),
        emoji: newBoardEmoji,
        isPrivate: newBoardIsPrivate,
      };
      setBoards([...boards, newBoard]);
      setNewBoardName("");
      setNewBoardEmoji(firstAvailableEmoji);
      setNewBoardIsPrivate(false);
      setShowEmojiDropdown(false);
    }
  };

  const removeBoard = (id: string) => {
    setBoards(boards.filter((board) => board.id !== id));
  };

  const addTag = () => {
    if (newTagName.trim()) {
      const colors = [
        "blue",
        "red",
        "green",
        "purple",
        "orange",
        "gray",
        "pink",
        "yellow",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: randomColor,
      };
      setTags([...tags, newTag]);
      setNewTagName("");
    }
  };

  const removeTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
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
              {boards.map((board) => (
                <TableRow key={board.id} className="border-b-0">
                  <TableCell className="text-xl">{board.emoji}</TableCell>
                  <TableCell className="font-medium">{board.name}</TableCell>
                  <TableCell>
                    <Badge variant={board.isPrivate ? "secondary" : "default"}>
                      {board.isPrivate ? "Private" : "Public"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBoard(board.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t border-muted-foreground/10 pt-6 mt-4">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmojiDropdown(!showEmojiDropdown)}
                    className="w-16 h-10 text-xl p-0"
                  >
                    {newBoardEmoji}
                  </Button>
                  {showEmojiDropdown && (
                    <div className="absolute top-12 left-0 z-10 bg-card border border-border rounded-md shadow-lg p-2 grid grid-cols-6 gap-1 w-48">
                      {availableEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setNewBoardEmoji(emoji);
                            setShowEmojiDropdown(false);
                          }}
                          disabled={usedEmojis.includes(emoji)}
                          className={`w-8 h-8 text-xl hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <p className="text-sm text-muted-foreground">
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
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="group relative">
                <Badge
                  variant="outline"
                  className={`${getColorClasses(tag.color)} relative cursor-pointer border pr-6 transition-all hover:pr-8`}
                >
                  {tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="-translate-y-1/2 absolute top-1/2 right-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
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

          <div className="border-t border-muted-foreground/10 pt-6 mt-8">
            <div className="flex gap-3">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addTag}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
