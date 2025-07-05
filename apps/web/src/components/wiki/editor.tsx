import {
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
	EditorContent,
	type EditorInstance,
	EditorRoot,
	type JSONContent,
	handleCommandNavigation,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// Extensions
import {
	CharacterCount,
	Color,
	HorizontalRule,
	Placeholder,
	StarterKit,
	TaskItem,
	TaskList,
	TextStyle,
	TiptapImage,
	TiptapLink,
} from "novel";

// Icons
import {
	CheckSquare,
	Code,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	List,
	ListOrdered,
	Text,
	TextQuote,
} from "lucide-react";

// Default content
const defaultEditorContent = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 1 },
			content: [{ type: "text", text: "Welcome to your Notion-like editor!" }],
		},
		{
			type: "paragraph",
			content: [
				{
					type: "text",
					text: "This editor includes:",
				},
			],
		},
		{
			type: "bulletList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [{ type: "text", text: "Rich text formatting" }],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [{ type: "text", text: "Slash commands" }],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [{ type: "text", text: "Task lists" }],
						},
					],
				},
			],
		},
		{
			type: "taskList",
			content: [
				{
					type: "taskItem",
					attrs: { checked: false },
					content: [
						{
							type: "paragraph",
							content: [{ type: "text", text: "Try checking this task" }],
						},
					],
				},
				{
					type: "taskItem",
					attrs: { checked: true },
					content: [
						{
							type: "paragraph",
							content: [{ type: "text", text: "This task is completed" }],
						},
					],
				},
			],
		},
		{
			type: "paragraph",
			content: [
				{
					type: "text",
					text: "Type '/' to see available commands...",
				},
			],
		},
	],
};

// Slash command suggestions
const suggestionItems = [
	{
		title: "Text",
		description: "Just start typing with plain text.",
		searchTerms: ["p", "paragraph"],
		icon: <Text size={18} />,
		command: ({ editor, range }: any) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.toggleNode("paragraph", "paragraph")
				.run();
		},
	},
	{
		title: "To-do List",
		description: "Track tasks with a to-do list.",
		searchTerms: ["todo", "task", "list", "check", "checkbox"],
		icon: <CheckSquare size={18} />,
		command: ({ editor, range }: any) => {
			editor.chain().focus().deleteRange(range).toggleTaskList().run();
		},
	},
	{
		title: "Heading 1",
		description: "Big section heading.",
		searchTerms: ["title", "big", "large"],
		icon: <Heading1 size={18} />,
		command: ({ editor, range }: any) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 1 })
				.run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading.",
		searchTerms: ["subtitle", "medium"],
		icon: <Heading2 size={18} />,
		command: ({ editor, range }: any) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 2 })
				.run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading.",
		searchTerms: ["subtitle", "small"],
		icon: <Heading3 size={18} />,
		command: ({ editor, range }: any) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 3 })
				.run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bullet list.",
		searchTerms: ["unordered", "point"],
		icon: <List size={18} />,
		command: ({ editor, range }: any) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a list with numbering.",
		searchTerms: ["ordered"],
		icon: <ListOrdered size={18} />,
		command: ({ editor, range }: any) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quote.",
		searchTerms: ["blockquote"],
		icon: <TextQuote size={18} />,
		command: ({ editor, range }: any) =>
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.toggleNode("paragraph", "paragraph")
				.toggleBlockquote()
				.run(),
	},
	{
		title: "Code",
		description: "Capture a code snippet.",
		searchTerms: ["codeblock"],
		icon: <Code size={18} />,
		command: ({ editor, range }: any) =>
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
	},
];

// Extensions configuration
const extensions = [
	StarterKit.configure({
		bulletList: {
			keepMarks: true,
			keepAttributes: false,
			HTMLAttributes: {
				class: "list-disc list-outside leading-3 -mt-2",
			},
		},
		orderedList: {
			keepMarks: true,
			keepAttributes: false,
			HTMLAttributes: {
				class: "list-decimal list-outside leading-3 -mt-2",
			},
		},
		listItem: {
			HTMLAttributes: {
				class: "leading-normal -mb-2",
			},
		},
		blockquote: {
			HTMLAttributes: {
				class: "border-l-4 border-blue-500 pl-4",
			},
		},
		codeBlock: {
			HTMLAttributes: {
				class:
					"rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border p-5 font-mono font-medium",
			},
		},
		code: {
			HTMLAttributes: {
				class:
					"rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-1 font-mono font-medium",
				spellcheck: "false",
			},
		},
		horizontalRule: false,
		dropcursor: {
			color: "#DBEAFE",
			width: 4,
		},
		gapcursor: false,
	}),
	Placeholder.configure({
		placeholder: ({ node }) => {
			if (node.type.name === "heading") {
				return "What's the title?";
			}
			return "Press '/' for commands";
		},
		includeChildren: true,
	}),
	TiptapLink.configure({
		HTMLAttributes: {
			class:
				"text-blue-500 underline underline-offset-[3px] hover:text-blue-700 transition-colors cursor-pointer",
		},
	}),
	TiptapImage.configure({
		allowBase64: true,
		HTMLAttributes: {
			class: "rounded-lg border border-gray-200 max-w-full h-auto",
		},
	}),
	TaskList.configure({
		HTMLAttributes: {
			class: "not-prose pl-2",
		},
	}),
	TaskItem.configure({
		HTMLAttributes: {
			class: "flex gap-2 items-start my-4",
		},
		nested: true,
	}),
	HorizontalRule.configure({
		HTMLAttributes: {
			class: "mt-4 mb-6 border-t border-gray-300",
		},
	}),
	CharacterCount.configure(),
	TextStyle,
	Color,
	EditorCommand.configure({
		suggestion: {
			items: () => suggestionItems,
			render: () => {
				let component: any;
				let popup: any;

				return {
					onStart: (props: any) => {
						component = {
							...props,
							filteredItems: suggestionItems,
						};
					},
					onUpdate: (props: any) => {
						component = {
							...props,
							filteredItems: suggestionItems.filter(
								(item) =>
									item.title
										.toLowerCase()
										.startsWith(props.query.toLowerCase()) ||
									item.searchTerms?.some((term) =>
										term.toLowerCase().startsWith(props.query.toLowerCase()),
									),
							),
						};
					},
					onKeyDown: (props: any) => {
						if (props.event.key === "Escape") {
							popup?.[0]?.destroy();
							return true;
						}
						return handleCommandNavigation(props.event);
					},
					onExit: () => {
						popup?.[0]?.destroy();
					},
				};
			},
		},
	}),
];

interface EditorProps {
	initialContent?: JSONContent;
	onUpdate?: (content: JSONContent) => void;
	editable?: boolean;
	className?: string;
}

const TailwindEditor = ({
	initialContent,
	onUpdate,
	editable = true,
	className = "",
}: EditorProps) => {
	const [content, setContent] = useState<JSONContent | null>(null);
	const [saveStatus, setSaveStatus] = useState("Saved");
	const [charsCount, setCharsCount] = useState<number>();

	const debouncedUpdates = useDebouncedCallback(
		async (editor: EditorInstance) => {
			const json = editor.getJSON();
			setContent(json);
			setCharsCount(editor.storage.characterCount.words());
			onUpdate?.(json);
			setSaveStatus("Saved");
		},
		500,
	);

	useEffect(() => {
		if (initialContent) {
			setContent(initialContent);
		} else {
			setContent(defaultEditorContent);
		}
	}, [initialContent]);

	if (!content) return null;

	return (
		<div className={`relative w-full ${className}`}>
			{/* Status bar */}
			<div className="flex items-center justify-between border-gray-200 border-b p-4">
				<div className="flex gap-4 text-gray-500 text-sm">
					<span>{saveStatus}</span>
					{charsCount !== undefined && <span>{charsCount} Words</span>}
				</div>
			</div>

			<EditorRoot>
				<EditorContent
					initialContent={content}
					extensions={extensions}
					editable={editable}
					editorProps={{
						handleKeyDown: (view, event) => handleCommandNavigation(event),
						attributes: {
							class:
								"prose prose-lg dark:prose-invert max-w-none focus:outline-none p-8 min-h-[500px]",
						},
					}}
					onUpdate={({ editor }) => {
						debouncedUpdates(editor);
						setSaveStatus("Unsaved");
					}}
					className="relative w-full max-w-screen-lg rounded-lg border border-gray-200 bg-white shadow-lg dark:bg-gray-900"
					slotAfter={<div className="h-[20vh]" />}
				>
					<EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-gray-200 bg-white px-1 py-2 shadow-md transition-all">
						<EditorCommandEmpty className="px-2 text-gray-500">
							No results
						</EditorCommandEmpty>
						<EditorCommandList>
							{suggestionItems.map((item) => (
								<EditorCommandItem
									value={item.title}
									onCommand={(val) => item.command(val)}
									className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-gray-100 aria-selected:bg-gray-100"
									key={item.title}
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white">
										{item.icon}
									</div>
									<div>
										<p className="font-medium">{item.title}</p>
										<p className="text-gray-500 text-xs">{item.description}</p>
									</div>
								</EditorCommandItem>
							))}
						</EditorCommandList>
					</EditorCommand>
				</EditorContent>
			</EditorRoot>
		</div>
	);
};

export default TailwindEditor;
