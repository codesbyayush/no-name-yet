import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings, BoardsSettings } from "@/components/admin/settings";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/_admin/settings")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "general",
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_admin/settings" });

  const handleTabChange = useCallback(
    (value: string) => {
      navigate({
        to: "/settings",
        search: { tab: value },
        replace: true,
      });
    },
    [navigate],
  );

  return (
    <div>
      <div className="sticky -top-12 z-10">
        <div className="bg-background backdrop-blur-2xl max-w-5xl mx-auto text-card-foreground">
          <SiteHeader title="Settings">
            <></>
          </SiteHeader>
          <div className="flex flex-1 flex-col">
            {/* Top Menu */}
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between px-4 py-3 md:px-6 ml-auto">
                {/* Tabbed Navigation */}
                <div className="flex items-center">
                  <Tabs
                    value={search.tab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="boards">Boards</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-muted-foreground/10" />
      </div>

      <div className="p-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <Tabs
            value={search.tab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsContent value="general" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">General</h2>
                  <p className="text-muted-foreground">
                    Manage your workspace settings and preferences.
                  </p>
                </div>
                <GeneralSettings />
              </div>
            </TabsContent>

            <TabsContent value="boards" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Boards</h2>
                  <p className="text-muted-foreground">
                    Configure your boards, tags, and submission settings.
                  </p>
                </div>
                <BoardsSettings />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
