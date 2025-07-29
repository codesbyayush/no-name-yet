import { ChangelogForm } from "@/components/admin/changelog-form";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { adminClient } from "@/utils/admin-orpc";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { IconArrowLeft } from "@tabler/icons-react";

export const Route = createFileRoute("/_admin/changelogs/edit/$id")({
  component: EditChangelogPage,
});

function EditChangelogPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch changelog data for editing
  const { data: changelogData, isLoading, error } = useQuery({
    queryKey: ["changelog", id],
    queryFn: async () => {
      const response = await adminClient.changelog.getChangelog({ id });
      return response.changelog;
    },
  });

  const handleSuccess = () => {
    navigate({ to: "/changelogs" });
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Edit Changelog">
          <Button variant="outline" asChild>
            <Link to="/changelogs">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Changelogs
            </Link>
          </Button>
        </SiteHeader>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading changelog...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !changelogData) {
    return (
      <>
        <SiteHeader title="Edit Changelog">
          <Button variant="outline" asChild>
            <Link to="/changelogs">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Changelogs
            </Link>
          </Button>
        </SiteHeader>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold mb-4 text-red-600">Error</h2>
                    <p className="text-muted-foreground mb-6">
                      Failed to load changelog. Please try again.
                    </p>
                    <Button asChild>
                      <Link to="/changelogs">
                        <IconArrowLeft className="h-4 w-4 mr-2" />
                        Back to Changelogs
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Edit Changelog">
        <Button variant="outline" asChild>
          <Link to="/changelogs">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Changelogs
          </Link>
        </Button>
      </SiteHeader>

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold mb-2">Edit Changelog</h1>
                  <p className="text-muted-foreground">
                    Update your changelog entry with new content and information.
                  </p>
                </div>
                
                <ChangelogForm
                  mode="edit"
                  changelogId={id}
                  initialData={{
                    title: changelogData.title,
                    content: changelogData.content,
                    excerpt: changelogData.excerpt || "",
                    version: changelogData.version || "",
                    tags: changelogData.tags || [],
                    metaTitle: changelogData.metaTitle || "",
                    metaDescription: changelogData.metaDescription || "",
                  }}
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}