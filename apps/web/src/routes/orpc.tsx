import { ORPCExample } from "@/components/ORPCExample";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orpc")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ORPCExample />;
}
