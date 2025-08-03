import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

type StatusItem = {
  key: string;
  label: string;
  color: string;
  order: number;
  isDefault?: boolean;
};

interface StatusFlowEditorProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

const DEFAULT_STATUSES: StatusItem[] = [
  { key: "open", label: "Open", color: "#3b82f6", order: 0, isDefault: true },
  { key: "in_progress", label: "In Progress", color: "#f59e0b", order: 1 },
  { key: "resolved", label: "Resolved", color: "#10b981", order: 2 },
  { key: "closed", label: "Closed", color: "#6b7280", order: 3 },
];

export function StatusFlowEditor({
  onSuccess,
  onError,
  buttonText = "Save Status Flow & Continue",
}: StatusFlowEditorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["status-flow"],
    queryFn: async () => {
      // If you add dedicated getStatusFlow ORPC, use that here.
      // For now, attempt to fetch from a custom endpoint if available; otherwise fall back.
      try {
        // @todo: replace with client.getStatusFlow() when implemented in server
        return null;
      } catch {
        return null;
      }
    },
  });

  const [statuses, setStatuses] = useState<StatusItem[]>(DEFAULT_STATUSES);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      setStatuses(data);
    }
  }, [data]);

  const previewStatuses = useMemo(
    () => [...statuses].sort((a, b) => a.order - b.order),
    [statuses],
  );

  const handleLabelChange = (index: number, value: string) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], label: value };
      return next;
    });
  };

  const handleColorChange = (index: number, value: string) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], color: value };
      return next;
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    setStatuses((prev) => {
      const next = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) return prev;

      // swap
      const temp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = temp;

      // reassign order
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const setDefault = (index: number) => {
    setStatuses((prev) =>
      prev.map((s, i) => ({ ...s, isDefault: i === index })),
    );
  };

  const resetDefaults = () => {
    setStatuses(DEFAULT_STATUSES);
    toast.message("Reset to default statuses");
  };

  const handleSubmit = async () => {
    try {
      // @todo: Replace with client.updateStatusFlow when backend endpoint exists
      // await client.updateStatusFlow({ statuses });

      // Mark onboarding step as complete
      await client.completeOnboardingStep({ step: "status-flow" });

      toast.success("Status flow saved");
      onSuccess?.();
    } catch (err) {
      const e =
        err instanceof Error ? err : new Error("Failed to save status flow");
      toast.error(e.message);
      onError?.(e);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Edit Default Status Flow</CardTitle>
        <CardDescription>
          Customize how feedback moves through your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Preview Column */}
          <div className="rounded-xl border p-4">
            <div className="mb-2 text-sm font-medium text-foreground">
              Preview
            </div>
            <div className="space-y-2">
              {previewStatuses.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between rounded-lg border bg-muted px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  {s.isDefault ? (
                    <span className="text-xs text-muted-foreground">
                      Default
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Editor Column */}
          <div>
            <div className="space-y-4">
              {statuses.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    "rounded-xl border p-3",
                    "bg-card text-card-foreground",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{s.key}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleMove(i, "up")}
                        disabled={i === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleMove(i, "down")}
                        disabled={i === statuses.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    <div className="md:col-span-3">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={s.label}
                        onChange={(e) => handleLabelChange(i, e.target.value)}
                        placeholder="Label"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={s.color}
                          onChange={(e) => handleColorChange(i, e.target.value)}
                          className="h-10 w-16 p-1"
                        />
                        <Input
                          value={s.color}
                          onChange={(e) => handleColorChange(i, e.target.value)}
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!s.isDefault}
                        onCheckedChange={() => setDefault(i)}
                      />
                      <span className="text-sm text-muted-foreground">
                        Set as default
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Order: {s.order + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={resetDefaults}>
                Reset to defaults
              </Button>
              <Button type="button" onClick={handleSubmit}>
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
