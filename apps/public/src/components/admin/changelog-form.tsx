import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminClient } from "@/utils/admin-orpc";
import type { Block } from "@blocknote/core";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import BlockNoteEditor, { type BlockNoteEditorRef } from "../blocknote-editor";

// Form validation schema
const changelogFormSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	excerpt: z.string().max(500, "Excerpt too long").optional(),
	version: z.string().max(50, "Version too long").optional(),
	tags: z.array(z.string()).default([]),
	metaTitle: z.string().max(200, "Meta title too long").optional(),
	metaDescription: z.string().max(500, "Meta description too long").optional(),
});

export interface ChangelogFormData {
	title: string;
	content?: Block[];
	excerpt?: string;
	version?: string;
	tags: string[];
	metaTitle?: string;
	metaDescription?: string;
}

export interface ChangelogFormProps {
	initialData?: Partial<ChangelogFormData>;
	onSave?: (data: ChangelogFormData) => Promise<void>;
	onSuccess?: () => void;
	mode?: "create" | "edit";
	changelogId?: string;
}

export function ChangelogForm({
	initialData,
	onSave,
	onSuccess,
	mode = "create",
	changelogId,
}: ChangelogFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const editorRef = useRef<BlockNoteEditorRef>(null);

	const form = useForm({
		defaultValues: {
			title: initialData?.title || "",
			excerpt: initialData?.excerpt || "",
			version: initialData?.version || "",
			tags: initialData?.tags || [],
			metaTitle: initialData?.metaTitle || "",
			metaDescription: initialData?.metaDescription || "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);

			try {
				// Get content from the editor using ref
				const editorContent = editorRef.current?.getContent() || [];

				const formData: ChangelogFormData = {
					...value,
					content: editorContent,
				};

				if (onSave) {
					await onSave(formData);
				} else {
					// Default save behavior
					if (mode === "create") {
						const result = await adminClient.changelog.createChangelog({
							title: formData.title,
							content: formData.content,
							excerpt: formData.excerpt,
							version: formData.version,
							tags: formData.tags,
							metaTitle: formData.metaTitle,
							metaDescription: formData.metaDescription,
						});
						toast.success("Changelog saved as draft successfully");
					} else if (mode === "edit" && changelogId) {
						const result = await adminClient.changelog.updateChangelog({
							id: changelogId,
							title: formData.title,
							content: formData.content,
							excerpt: formData.excerpt,
							version: formData.version,
							tags: formData.tags,
							metaTitle: formData.metaTitle,
							metaDescription: formData.metaDescription,
						});
						toast.success("Changelog updated successfully");
					}
				}

				if (onSuccess) {
					onSuccess();
				}
			} catch (error) {
				toast.error("Failed to save changelog. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = changelogFormSchema.safeParse(value);
				if (!result.success) {
					return result.error.formErrors.fieldErrors;
				}
				return undefined;
			},
		},
	});

	return (
		<div className="space-y-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* Title Field */}
				<form.Field
					name="title"
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Title <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter changelog title..."
								className={
									field.state.meta.errors.length > 0 ? "border-red-500" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-500 text-sm">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				/>

				{/* Version Field */}
				<form.Field
					name="version"
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Version</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="e.g., v1.2.0"
								className={
									field.state.meta.errors.length > 0 ? "border-red-500" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-500 text-sm">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				/>

				{/* Excerpt Field */}
				<form.Field
					name="excerpt"
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Excerpt</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Brief description of the changelog..."
								className={
									field.state.meta.errors.length > 0 ? "border-red-500" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-500 text-sm">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				/>

				{/* Content Editor */}
				<div className="space-y-2">
					<Label>
						Content <span className="text-red-500">*</span>
					</Label>
					<div className="rounded-md border">
						<BlockNoteEditor
							ref={editorRef}
							initialContent={initialData?.content}
							placeholder="Start writing your changelog content..."
							className="min-h-[300px]"
						/>
					</div>
				</div>

				{/* Meta Title Field */}
				<form.Field
					name="metaTitle"
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Meta Title (SEO)</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="SEO title for search engines..."
								className={
									field.state.meta.errors.length > 0 ? "border-red-500" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-500 text-sm">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				/>

				{/* Meta Description Field */}
				<form.Field
					name="metaDescription"
					children={(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Meta Description (SEO)</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="SEO description for search engines..."
								className={
									field.state.meta.errors.length > 0 ? "border-red-500" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-red-500 text-sm">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				/>

				{/* Form Actions */}
				<div className="flex gap-4 pt-4">
					<Button type="submit" disabled={isLoading} className="flex-1">
						{isLoading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
								Saving...
							</>
						) : (
							"Save as Draft"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
