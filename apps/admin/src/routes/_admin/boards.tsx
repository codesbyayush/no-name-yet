import { RenderPostsList } from "@/components/admin/render-posts-list";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import data from "@/app/dashboard/data.json";

export const Route = createFileRoute("/_admin/boards")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    search: (search.search as string) || "",
    tag: (search.tag as string) || "all",
    status: (search.status as string) || "all",
    order: (search.order as string) || "name-asc",
    tab: (search.tab as string) || "all",
  }),
});

const mockBoards = [
  {
    id: 1,
    title: "Product Feedback",
    description: "Collect and manage product feedback from users",
    status: "active",
    tags: ["feature-request", "bug-report"],
  },
  {
    id: 2,
    title: "Feature Requests",
    description: "Track new feature requests and ideas",
    status: "active",
    tags: ["enhancement"],
  },
  {
    id: 3,
    title: "Bug Reports",
    description: "Report and track software bugs",
    status: "active",
    tags: ["bug"],
  },
  {
    id: 4,
    title: "General Discussion",
    description: "General community discussions and ideas",
    status: "archived",
    tags: ["discussion"],
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_admin/boards" });

  // Debounced search update to prevent excessive re-renders
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Local search state for immediate input feedback
  const [localSearchValue, setLocalSearchValue] = useState(search.search || "");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Sync local search value with URL search param
  useEffect(() => {
    setLocalSearchValue(search.search || "");
  }, [search.search]);

  // Update search params using TanStack Router's navigate
  const updateSearch = useCallback(
    (updates: Record<string, string>) => {
      const newSearch = {
        search: search.search || "",
        tag: search.tag || "all",
        status: search.status || "all",
        order: search.order || "name-asc",
        tab: search.tab || "all",
        ...updates,
      };

      // Remove 'all' values and empty strings to keep URL clean
      const cleanSearch: Record<string, string> = {};
      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.entries(newSearch).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "name-asc") {
          cleanSearch[key] = value;
        }
      });

      // Ensure all required search parameters are present
      const finalSearch = {
        search: cleanSearch.search || "",
        tag: cleanSearch.tag || "all",
        status: cleanSearch.status || "all",
        order: cleanSearch.order || "name-asc",
        tab: cleanSearch.tab || "all",
      };

      navigate({
        to: "/boards",
        search: finalSearch,
        replace: true,
      });
    },
    [navigate, search],
  );

  // Handle search input change with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        updateSearch({ search: value });
      }, 300); // 300ms debounce

      setSearchTimeout(timeout);
    },
    [searchTimeout, updateSearch],
  );

  // Handle immediate filter changes (no debouncing needed)
  const handleTagChange = useCallback(
    (value: string) => {
      updateSearch({ tag: value });
    },
    [updateSearch],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      updateSearch({ status: value });
    },
    [updateSearch],
  );

  const handleOrderChange = useCallback(
    (value: string) => {
      updateSearch({ order: value });
    },
    [updateSearch],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      updateSearch({ tab: value });
    },
    [updateSearch],
  );

  // Filter boards based on URL state
  const filteredBoards = mockBoards.filter((board) => {
    // Search filter
    if (
      search.search &&
      !board.title.toLowerCase().includes(search.search.toLowerCase()) &&
      !board.description.toLowerCase().includes(search.search.toLowerCase())
    ) {
      return false;
    }

    // Tag filter
    if (search.tag !== "all" && !board.tags.includes(search.tag)) {
      return false;
    }

    // Status filter
    if (search.status !== "all" && board.status !== search.status) {
      return false;
    }

    return true;
  });

  // Sort boards based on URL state
  const sortedBoards = [...filteredBoards].sort((a, b) => {
    switch (search.order) {
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      case "created-desc":
        return b.id - a.id; // Using ID as proxy for creation date
      case "created-asc":
        return a.id - b.id;
      default:
        return 0;
    }
  });

  // Get current board for individual tab view
  const currentBoard =
    search.tab !== "all"
      ? mockBoards.find((board) => `board-${board.id}` === search.tab)
      : null;

  return (
    <div>
      <div className="-top-12 sticky z-10">
        <div className="mx-auto max-w-5xl bg-background text-card-foreground backdrop-blur-2xl">
          <SiteHeader title="Boards">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Search boards..."
                  className="!bg-muted h-10 w-64 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={localSearchValue}
                  onChange={(e) => {
                    setLocalSearchValue(e.target.value);
                    handleSearchChange(e.target.value);
                  }}
                />
              </div>

              {/* Tags Filter */}
              <Select value={search.tag} onValueChange={handleTagChange}>
                <SelectTrigger className="!bg-muted hover:!bg-muted focus:!bg-muted h-10 w-32 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent className="!bg-muted rounded-2xl border-muted-foreground/10 p-2 shadow-xl">
                  <SelectItem
                    value="all"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    All Tags
                  </SelectItem>
                  <SelectItem
                    value="feature-request"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Feature Request
                  </SelectItem>
                  <SelectItem
                    value="bug-report"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Bug Report
                  </SelectItem>
                  <SelectItem
                    value="enhancement"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Enhancement
                  </SelectItem>
                  <SelectItem
                    value="bug"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Bug
                  </SelectItem>
                  <SelectItem
                    value="discussion"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Discussion
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={search.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="!bg-muted hover:!bg-muted focus:!bg-muted h-10 w-32 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="!bg-muted rounded-2xl border-muted-foreground/10 p-2 shadow-xl">
                  <SelectItem
                    value="all"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="archived"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Archived
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Order */}
              <Select value={search.order} onValueChange={handleOrderChange}>
                <SelectTrigger className="!bg-muted hover:!bg-muted focus:!bg-muted h-10 w-36 rounded-xl border-muted-foreground/20 px-4 text-base text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="!bg-muted rounded-2xl border-muted-foreground/10 p-2 shadow-xl">
                  <SelectItem
                    value="name-asc"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Name A-Z
                  </SelectItem>
                  <SelectItem
                    value="name-desc"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Name Z-A
                  </SelectItem>
                  <SelectItem
                    value="created-asc"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Created (Oldest)
                  </SelectItem>
                  <SelectItem
                    value="created-desc"
                    className="hover:!bg-background focus:!bg-background cursor-pointer rounded-xl px-4 py-2 text-base"
                  >
                    Created (Newest)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SiteHeader>
          <div className="flex flex-1 flex-col">
            {/* Top Menu */}
            <div className=" backdrop-blur">
              <div className="ml-auto flex items-center justify-between px-4 py-3 md:px-6">
                {/* Right Side - Tabbed Navigation */}
                <div className="flex items-center">
                  <Tabs
                    value={search.tab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {mockBoards.map((board) => (
                        <TabsTrigger key={board.id} value={`board-${board.id}`}>
                          {board.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-muted border-t-4" />
      </div>
      <div className="p-6 md:px-10">
        <RenderPostsList />
      </div>
      <DataTable data={data} />
    </div>
  );
}
