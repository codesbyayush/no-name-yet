import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { client } from '@/utils/orpc';

type NewTagRow = { name: string; color: string };

interface CustomTagsFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

export function CustomTagsForm({
  onSuccess,
  onError,
  buttonText = 'Save Tags & Finish',
}: CustomTagsFormProps) {
  const [rows, setRows] = useState<NewTagRow[]>([
    { name: '', color: '#3b82f6' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const addRow = () => {
    setRows((prev) => [...prev, { name: '', color: '#10b981' }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, patch: Partial<NewTagRow>) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = rows
        .map((r) => ({ name: r.name.trim(), color: r.color }))
        .filter((r) => r.name.length > 0);

      for (const t of payload) {
        await client.admin.organization.tagsRouter.create({
          name: t.name,
          color: t.color,
        });
      }

      await client.completeOnboardingStep({ step: 'complete' });
      queryClient.invalidateQueries({ queryKey: ['tags'] });

      toast.success('Tags saved');
      onSuccess?.();
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to save tags');
      toast.error(e.message);
      onError?.(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Add Custom Tags</CardTitle>
        <CardDescription>
          Organize feedback with tags that fit your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Preview */}
          <div className="rounded-xl border p-4">
            <div className="mb-2 font-medium text-foreground text-sm">
              Preview
            </div>
            <div className="flex flex-wrap gap-2">
              {rows
                .filter((r) => r.name.trim().length > 0)
                .map((r, i) => (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 font-medium text-xs"
                    key={`${r.name}-${i}`}
                    style={{
                      backgroundColor: `${r.color}1a`,
                      color: r.color,
                      border: `1px solid ${r.color}66`,
                    }}
                  >
                    {r.name}
                  </span>
                ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="space-y-4">
              {rows.map((row, i) => (
                <div className="rounded-xl border p-3" key={i}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    <div className="md:col-span-3">
                      <Label className="text-xs">Tag name</Label>
                      <Input
                        onChange={(e) => updateRow(i, { name: e.target.value })}
                        placeholder="e.g. Backend, UI, Docs"
                        value={row.name}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          className="h-10 w-16 p-1"
                          onChange={(e) =>
                            updateRow(i, { color: e.target.value })
                          }
                          type="color"
                          value={row.color}
                        />
                        <Input
                          onChange={(e) =>
                            updateRow(i, { color: e.target.value })
                          }
                          placeholder="#10b981"
                          value={row.color}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    {rows.length > 1 ? (
                      <Button
                        onClick={() => removeRow(i)}
                        size="sm"
                        variant="ghost"
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button onClick={addRow} type="button" variant="outline">
                Add another tag
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting ? 'Saving...' : buttonText}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
