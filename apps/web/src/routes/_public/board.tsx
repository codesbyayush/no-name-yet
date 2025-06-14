import { client, orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/board")({
  component: BoardLayout,
});

function BoardLayout() {
  const boardSubPages = [
    { to: "/board/features", label: "Features" },
    { to: "/board/bugs", label: "Bug Reports" },
    { to: "/board/feedback", label: "Feedback" },
  ];

  const { data } = useQuery({
    queryKey: ["boards"],
    queryFn: () => client.getAllPublicBoards(),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Board</h1>
        <p className="text-muted-foreground">
          Browse and interact with features, bugs, and feedback
        </p>
      </div>

      <div className="mb-6">
        <nav className="flex gap-4">
          {boardSubPages.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-md bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              {label}
            </Link>
          ))}
          {data?.boards.map(({ id, name, slug }) => (
            <Link
              key={id}
              to={`/board/${slug}`}
              className="rounded-md bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              {name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
