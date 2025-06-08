import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Define the params schema for the tenant slug
const tenantSlugSchema = z.object({
  tenantSlug: z.string().min(1),
});

export const Route = createFileRoute("/$tenantSlug")({
  // Validate the tenant slug parameter
  params: {
    parse: (params) => tenantSlugSchema.parse(params),
    stringify: ({ tenantSlug }) => ({ tenantSlug }),
  },

  // Optional: Add validation for valid tenant slugs
  beforeLoad: async ({ params }) => {
    const { tenantSlug } = params;

    // You can add tenant validation logic here
    // For example, check if the tenant exists in your database
    // For now, we'll just ensure it's not empty and follows basic slug format
    const isValidSlug = /^[a-z0-9-]+$/.test(tenantSlug);

    if (!isValidSlug) {
      throw redirect({
        to: "/",
        search: {
          error: "Invalid tenant identifier",
        },
      });
    }

    // Store tenant slug in context for child routes to use
    return {
      tenantSlug,
    };
  },

  component: TenantSlugLayout,
});

function TenantSlugLayout() {
  const { tenantSlug } = Route.useParams();
  const context = Route.useRouteContext();

  // This layout wraps all tenant-specific routes
  // You can add tenant-specific logic, theme, or configuration here

  return (
    <div data-tenant={tenantSlug}>
      {/* Render child routes */}
      <Outlet />
    </div>
  );
}
