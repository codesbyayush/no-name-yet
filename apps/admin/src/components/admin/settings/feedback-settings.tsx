import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUpDown,
  Clock,
  Info,
  Lightbulb,
  PlusIcon,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      id: "reviewing",
      name: "Reviewing",
      statuses: [
        {
          id: "in-review",
          name: "In Review",
          category: "reviewing",
          isDefault: true,
          hex: "#42A5F5",
        },
      ],
    },
    {
      id: "planned",
      name: "Planned",
      statuses: [
        {
          id: "planned",
          name: "Planned",
          category: "planned",
          hex: "#AB47BC",
        },
      ],
    },
    {
      id: "active",
      name: "Active",
      statuses: [
        {
          id: "in-progress",
          name: "In Progress",
          category: "active",
          hex: "#42A5F5",
        },
      ],
    },
    {
      id: "completed",
      name: "Completed",
      statuses: [
        {
          id: "completed",
          name: "Completed",
          category: "completed",
          hex: "#8BC34A",
        },
      ],
    },
    {
      id: "canceled",
      name: "Canceled",
      statuses: [
        {
          id: "rejected",
          name: "Rejected",
          category: "canceled",
          hex: "#F44336",
        },
      ],
    },
  ]);

  const [hideCompletedCanceled, setHideCompletedCanceled] = useState(false);
  const [hideAllStatuses, setHideAllStatuses] = useState(false);

  // Add Status Dialog state
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(
    null,
  );
  const [newStatusName, setNewStatusName] = useState("");
  const colorPalette = [
    "#F44336",
    "#FF9800",
    "#FFC107",
    "#8BC34A",
    "#26A69A",
    "#00BCD4",
    "#42A5F5",
    "#5C6BC0",
    "#AB47BC",
    "#EC407A",
  ];
  const [selectedColor, setSelectedColor] = useState<string>(colorPalette[0]);

  const [feedbackBoards, setFeedbackBoards] = useState<FeedbackBoard[]>([
    {
      id: "feature-request",
      name: "Feature Request",
      icon: "lightbulb",
    },
  ]);

  const [defaultSorting, setDefaultSorting] = useState("recent-posts");

  // Empty handlers for future backend integration
  const handleAddStatus = (categoryId: string) => {
    setPendingCategoryId(categoryId);
    setNewStatusName("");
    setSelectedColor(colorPalette[0]);
    setAddStatusOpen(true);
  };

  const handleEditStatus = (statusId: string) => {
    console.log("Edit status:", statusId);
    // TODO: Implement backend integration
  };

  const handleDeleteStatus = (statusId: string) => {
    console.log("Delete status:", statusId);
    // TODO: Implement backend integration
  };

  const handleConfirmAddStatus = () => {
    if (!pendingCategoryId || !newStatusName.trim()) {
      return;
    }
    const id = newStatusName.toLowerCase().replace(/\s+/g, "-");
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
          : cat,
      ),
    );
    console.log("Create status:", {
      name: newStatusName.trim(),
      hex: selectedColor,
      categoryId: pendingCategoryId,
    });
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
  const handleAddBoard = () => {
    console.log("Add new feedback board");
    // TODO: Implement backend integration
  };

  const handleEditBoard = (boardId: string) => {
    console.log("Edit board:", boardId);
    // TODO: Implement backend integration
  };

  const handleDeleteBoard = (boardId: string) => {
    console.log("Delete board:", boardId);
    // TODO: Implement backend integration
  };

  const handleBoardInfo = (boardId: string) => {
    console.log("Show board info:", boardId);
    // TODO: Implement backend integration
  };

  const handleDefaultSortingChange = (value: string) => {
    setDefaultSorting(value);
    // TODO: Implement backend integration
  };

  return (
    <div className="space-y-8">
      {/* Feedback Module Section */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <CardTitle>Feedback module</CardTitle>
          <CardDescription>
            Reorder, customize or remove links (modules) from being displayed
            from public portal or widgets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button onClick={handleAddBoard} className="bg-primary">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add board
            </Button>
          </div>

          <div className="space-y-3">
            {feedbackBoards.map((board) => (
              <div
                key={board.id}
                className="flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/20 p-4"
              >
                <div className="flex items-center space-x-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{board.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBoardInfo(board.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditBoard(board.id)}
                    className="h-8 px-3"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBoard(board.id)}
                    className="h-8 px-3 text-destructive hover:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Default sorting</Label>
            <Select
              value={defaultSorting}
              onValueChange={handleDefaultSortingChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent-posts">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Recent posts</span>
                  </div>
                </SelectItem>
                <SelectItem value="most-voted">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Most voted</span>
                  </div>
                </SelectItem>
                <SelectItem value="oldest-first">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Oldest first</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statuses Section */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <CardTitle>Statuses</CardTitle>
          <CardDescription>
            Customize existing ones or add extra statuses you can add for posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {statusCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStatus(category.id)}
                  className="h-8 px-3"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {category.statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/20 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: status.hex ?? "#9E9E9E" }}
                      />
                      <span className="font-medium">{status.name}</span>
                      {status.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStatus(status.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStatus(status.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Add Status Dialog */}
          <Dialog open={addStatusOpen} onOpenChange={setAddStatusOpen}>
            <DialogContent className="rounded-2xl border-muted-foreground/10 bg-card">
              <DialogHeader>
                <DialogTitle>Add Status</DialogTitle>
                <DialogDescription>
                  Enter a name for your new status and choose a color.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Name</Label>
                  <input
                    className="h-10 w-full rounded-md border border-muted-foreground/20 bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Next Release"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Choose color</Label>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {colorPalette.map((hex) => (
                      <button
                        type="button"
                        key={hex}
                        className={`aspect-square w-full rounded-md ring-offset-background transition-shadow focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${selectedColor === hex ? "ring-2 ring-primary" : "ring-0"}`}
                        style={{ backgroundColor: hex }}
                        onClick={() => setSelectedColor(hex)}
                        aria-label={`Select color ${hex}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setAddStatusOpen(false)}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAddStatus}
                  disabled={!newStatusName.trim()}
                  className="h-9 bg-primary"
                >
                  Add Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Hiding Options Section */}
      <Card className="border border-muted-foreground/10 bg-card">
        <CardHeader>
          <CardTitle>Hiding Options</CardTitle>
          <CardDescription>
            Configure visibility settings for your feedback board.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hide-completed-canceled"
              checked={hideCompletedCanceled}
              onCheckedChange={handleHideCompletedCanceledChange}
            />
            <div className="space-y-1">
              <Label
                htmlFor="hide-completed-canceled"
                className="font-medium text-sm"
              >
                Hide completed and canceled posts from feedback board
              </Label>
              <p className="text-muted-foreground text-sm">
                By default completed and canceled posts are shown on the
                feedback board. You can hide them to keep your feedback board
                clean.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="hide-all-statuses"
              checked={hideAllStatuses}
              onCheckedChange={handleHideAllStatusesChange}
            />
            <div className="space-y-1">
              <Label
                htmlFor="hide-all-statuses"
                className="font-medium text-sm"
              >
                Hide all statuses from public feedback board
              </Label>
              <p className="text-muted-foreground text-sm">
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
