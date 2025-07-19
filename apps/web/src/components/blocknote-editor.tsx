import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useEffect, useMemo } from "react";

export interface BlockNoteEditorProps {
  initialContent?: Block[];
  onChange?: (content: Block[]) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export default function BlockNoteEditor({
  initialContent,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  className,
}: BlockNoteEditorProps) {
  // Creates a new editor instance with initial content
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  // Handle content changes
  useEffect(() => {
    if (!onChange) return;

    const handleChange = () => {
      const content = editor.document;
      onChange(content);
    };

    // Listen for document changes
    editor.onEditorContentChange(handleChange);

    // Cleanup listener on unmount
    return () => {
      // BlockNote doesn't provide a direct way to remove listeners
      // The editor instance will be cleaned up when component unmounts
    };
  }, [editor, onChange]);

  // Update editor content when initialContent changes
  useEffect(() => {
    if (initialContent && editor.document !== initialContent) {
      editor.replaceBlocks(editor.document, initialContent);
    }
  }, [initialContent, editor]);

  // Memoize editor configuration to prevent unnecessary re-renders
  const editorConfig = useMemo(() => ({
    editor,
    shadCNComponents: {
      // Pass modified ShadCN components from your project here.
      // Otherwise, the default ShadCN components will be used.
    },
    theme: "light" as const,
    editable,
    placeholder,
  }), [editor, editable, placeholder]);

  return (
    <div className={className}>
      <BlockNoteView {...editorConfig} />
    </div>
  );
}
