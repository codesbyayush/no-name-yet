import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

interface Board {
  id: string;
  name: string;
  type: "public" | "private" | "internal";
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export function BoardsSettings() {
  const [allowGuestSubmissions, setAllowGuestSubmissions] = useState(false);
  const [boards, setBoards] = useState<Board[]>([
    { id: "1", name: "Feature Requests", type: "public" },
    { id: "2", name: "Bug Reports", type: "public" },
    { id: "3", name: "General Feedback", type: "public" },
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
  const [newBoardType, setNewBoardType] = useState<"public" | "private">(
    "public",
  );
  const [newTagName, setNewTagName] = useState("");

  const addBoard = () => {
    if (newBoardName.trim()) {
      const newBoard: Board = {
        id: Date.now().toString(),
        name: newBoardName.trim(),
        type: newBoardType,
      };
      setBoards([...boards, newBoard]);
      setNewBoardName("");
      setNewBoardType("public");
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
      <Card className="bg-card border border-muted-foreground/10">
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
              <p className="text-sm text-muted-foreground">
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
      <Card className="bg-card border border-muted-foreground/10">
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boards.map((board) => (
                <TableRow key={board.id} className="border-b-0">
                  <TableCell className="font-medium">{board.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        board.type === "public" ? "default" : "secondary"
                      }
                    >
                      {board.type}
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

          <div className="flex gap-3 pt-4">
            <Input
              placeholder="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="flex-1"
            />
            <Select
              value={newBoardType}
              onValueChange={(value: "public" | "private") =>
                setNewBoardType(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addBoard}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Board
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manage Tags Section */}
      <Card className="bg-card border border-muted-foreground/10">
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
              <div key={tag.id} className="relative group">
                <Badge
                  variant="outline"
                  className={`${getColorClasses(tag.color)} border cursor-pointer relative pr-6 transition-all hover:pr-8`}
                >
                  {tag.name}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 rounded-full p-0.5"
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

          <div className="flex gap-3 pt-4">
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addTag}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
