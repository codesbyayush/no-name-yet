import { BoardsSettings, GeneralSettings } from "@/components/admin/settings";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <div className="-top-12 sticky z-10">
        <div className="mx-auto max-w-5xl bg-background text-card-foreground backdrop-blur-2xl">
          <SiteHeader title="Settings">
            <></>
          </SiteHeader>
          <div className="flex flex-1 flex-col">
            {/* Top Menu */}
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="ml-auto flex items-center justify-between px-4 py-3 md:px-6">
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
        <div className="w-full border-muted-foreground/10 border-t" />
      </div>

      <div className="p-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <Tabs
            value={search.tab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsContent value="general" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-2xl tracking-tight">General</h2>
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
                  <h2 className="font-bold text-2xl tracking-tight">Boards</h2>
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
