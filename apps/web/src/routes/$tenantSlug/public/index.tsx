import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$tenantSlug/public/")({
  beforeLoad: ({ params }) => {
    // Redirect to board by default, just like the original public route
    throw redirect({
      to: "/$tenantSlug/public/board",
      params: { tenantSlug: params.tenantSlug },
    });
  },
});
