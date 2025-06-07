import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/public/roadmap")({
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground">
          See what's coming next and what we're working on
        </p>
      </div>

      <div className="grid gap-6">
        {/* Now */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-blue-600">Now</h2>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Core Features Implementation</h3>
            <p className="text-sm text-muted-foreground">
              Building the foundation of our platform
            </p>
          </div>
        </div>

        {/* Next */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-600">Next</h2>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Advanced Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Enhanced reporting and insights
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">API Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect with external services
            </p>
          </div>
        </div>

        {/* Later */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-600">Later</h2>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Mobile App</h3>
            <p className="text-sm text-muted-foreground">
              Native mobile applications
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Enterprise Features</h3>
            <p className="text-sm text-muted-foreground">
              Advanced security and team management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
