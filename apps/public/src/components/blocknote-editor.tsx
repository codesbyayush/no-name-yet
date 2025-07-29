import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useTheme } from "./theme-provider";

export interface BlockNoteEditorProps {
  initialContent?: Block[];
  onChange?: (content: Block[]) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export interface BlockNoteEditorRef {
  getContent: () => Block[];
}

const BlockNoteEditor = forwardRef<BlockNoteEditorRef, BlockNoteEditorProps>(({
  initialContent,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  className,
}, ref) => {
  // Creates a new editor instance with initial content
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  const { theme } = useTheme();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getContent: () => editor.document,
  }), [editor]);

  // Handle content changes if onChange is provided
  if (onChange) {
    editor.onChange(() => {
      onChange(editor.document);
    });
  }

  // Memoize editor configuration to prevent unnecessary re-renders
  const editorConfig = useMemo(() => ({
    editor,
    shadCNComponents: {
      // Pass modified ShadCN components from your project here.
      // Otherwise, the default ShadCN components will be used.
    },
    theme: theme === "dark" ? "dark" as const : "light" as const,
    editable,
    placeholder,
  }), [editor, editable, placeholder, theme]);

  return (
    <div className={className}>
      <BlockNoteView {...editorConfig} />
    </div>
  );
});

BlockNoteEditor.displayName = "BlockNoteEditor";

export default BlockNoteEditor;
