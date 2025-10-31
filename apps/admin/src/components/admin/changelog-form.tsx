import type { Block } from '@blocknote/core';
import { useForm } from '@tanstack/react-form';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { adminClient } from '@/utils/admin-orpc';
import BlockNoteEditor, { type BlockNoteEditorRef } from '../blocknote-editor';

const TITLE_MAX_LENGTH = 200;

// Form validation schema
const changelogFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(TITLE_MAX_LENGTH, 'Title too long'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tag: z.string().optional(),
});

export interface ChangelogFormData {
  title: string;
  content?: Block[];
  status?: 'draft' | 'published' | 'archived';
  tag?: string;
}

export interface ChangelogFormProps {
  initialData?: Partial<ChangelogFormData>;
  onSave?: (data: ChangelogFormData) => Promise<void>;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  changelogId?: string;
}

export function ChangelogForm({
  initialData,
  onSave,
  onSuccess,
  mode = 'create',
  changelogId,
}: ChangelogFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<BlockNoteEditorRef>(null);

  const saveChangelog = async (formData: ChangelogFormData) => {
    if (onSave) {
      await onSave(formData);
      return;
    }

    if (mode === 'create') {
      await adminClient.organization.changelog.add({
        title: formData.title,
        content: formData.content,
        status: formData.status || 'draft',
        tagId: formData.tag || undefined,
      });
      toast.success('Changelog saved successfully');
    } else if (mode === 'edit' && changelogId) {
      await adminClient.organization.changelog.update({
        id: changelogId,
        title: formData.title,
        content: formData.content,
        status: formData.status,
        tagId: formData.tag || undefined,
      });
      toast.success('Changelog updated successfully');
    }
  };

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      status: (initialData?.status || 'draft') as
        | 'draft'
        | 'published'
        | 'archived',
      tag: initialData?.tag || '',
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        const editorContent = editorRef.current?.getContent() || [];
        const formData: ChangelogFormData = {
          ...value,
          content: editorContent,
        };

        await saveChangelog(formData);

        if (onSuccess) {
          onSuccess();
        }
      } catch (_error) {
        toast.error('Failed to save changelog. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = changelogFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.message;
        }
        return;
      },
    },
  });

  return (
    <div className='space-y-6'>
      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* Title Field */}
        <form.Field name='title'>
          {(field) => (
            <div className='space-y-2'>
              <Label htmlFor={field.name}>
                Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                className={
                  field.state.meta.errors.length > 0 ? 'border-red-500' : ''
                }
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder='Enter changelog title...'
                value={field.state.value}
              />
              {field.state.meta.errors.length > 0 && (
                <p className='text-red-500 text-sm'>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Content Editor */}
        <div className='space-y-2'>
          <Label>
            Content <span className='text-red-500'>*</span>
          </Label>
          <div className='rounded-md border'>
            <BlockNoteEditor
              className='min-h-[300px]'
              initialContent={initialData?.content}
              placeholder='Start writing your changelog content...'
              ref={editorRef}
            />
          </div>
        </div>

        {/* Status Field */}
        <form.Field name='status'>
          {(field) => (
            <div className='space-y-3'>
              <Label>Status</Label>
              <RadioGroup
                className='grid w-full grid-cols-3 gap-4'
                onValueChange={(value) =>
                  field.handleChange(
                    value as 'draft' | 'published' | 'archived',
                  )
                }
                value={field.state.value}
              >
                <div className='flex items-center space-x-2 rounded-lg border border-input bg-background pl-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
                  <RadioGroupItem id='draft' value='draft' />
                  <Label
                    className='flex-1 cursor-pointer px-3 py-2 font-normal'
                    htmlFor='draft'
                  >
                    Draft
                  </Label>
                </div>
                <div className='flex items-center space-x-2 rounded-lg border border-input bg-background pl-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
                  <RadioGroupItem id='published' value='published' />
                  <Label
                    className='flex-1 cursor-pointer px-3 py-2 font-normal'
                    htmlFor='published'
                  >
                    Published
                  </Label>
                </div>
                <div className='flex items-center space-x-2 rounded-lg border border-input bg-background pl-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
                  <RadioGroupItem id='archived' value='archived' />
                  <Label
                    className='flex-1 cursor-pointer px-3 py-2 font-normal'
                    htmlFor='archived'
                  >
                    Archived
                  </Label>
                </div>
              </RadioGroup>
              {field.state.meta.errors.length > 0 && (
                <p className='text-red-500 text-sm'>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Form Actions */}
        <div className='flex gap-4 pt-4'>
          <Button className='flex-1' disabled={isLoading} type='submit'>
            {isLoading ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2' />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
