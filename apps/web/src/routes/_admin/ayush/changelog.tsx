import BlockNoteEditor from "@/components/blocknote-editor";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";

export const Route = createFileRoute("/_admin/ayush/changelog")({
	component: ChangelogPage,
});

function ChangelogPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState<any[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!title.trim()) {
			alert("Please enter a title");
			return;
		}

		setIsSaving(true);
		try {
			// TODO: Implement save logic to your backend
			console.log("Saving changelog:", { title, content });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			alert("Changelog saved successfully!");
			setTitle("");
			setContent([]);
		} catch (error) {
			console.error("Error saving changelog:", error);
			alert("Error saving changelog");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePublish = async () => {
		if (!title.trim()) {
			alert("Please enter a title");
			return;
		}

		setIsSaving(true);
		try {
			// TODO: Implement publish logic to your backend
			console.log("Publishing changelog:", { title, content });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			alert("Changelog published successfully!");
			setTitle("");
			setContent([]);
		} catch (error) {
			console.error("Error publishing changelog:", error);
			alert("Error publishing changelog");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Changelog</h1>
					<p className="text-muted-foreground">
						Create and manage changelog entries for your product updates.
					</p>
				</div>
			</div>

			<Separator />

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Create New Changelog Entry</CardTitle>
						<CardDescription>
							Write a new changelog entry using the rich text editor below.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								placeholder="Enter changelog title..."
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Content</Label>
							<div className="rounded-md border">
								<BlockNoteEditor />
							</div>
						</div>

						<div className="flex gap-2 pt-4">
							<Button
								onClick={handleSave}
								disabled={isSaving || !title.trim()}
								variant="outline"
							>
								{isSaving ? "Saving..." : "Save Draft"}
							</Button>
							<Button
								onClick={handlePublish}
								disabled={isSaving || !title.trim()}
							>
								{isSaving ? "Publishing..." : "Publish"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
