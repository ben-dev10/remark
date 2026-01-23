"use client";
import { Editor, type JSONContent, EditorContent } from "@tiptap/react";
import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Code, Italic, Strikethrough } from "lucide-react";
import { cn } from "@/utils/lib/utils";
import { cva } from "class-variance-authority";
import Placeholder from "@tiptap/extension-placeholder";

export type CommentEditorProps = Editor;

export interface EditorProps {
  defaultValue?: JSONContent;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (editor: CommentEditorProps) => void;
  onSubmit?: (editor: CommentEditorProps) => void;
  onEscape?: (editor: CommentEditorProps) => void;
  editorProps?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
  onReady?: (editor: Editor) => void;

  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export const CommentEditor = forwardRef<HTMLDivElement, EditorProps>(
  function CommentEditor(
    { disabled = false, onChange, onReady, containerProps, children, ...props },
    ref,
  ) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const editorRef = useRef<Editor | null>(null);

    //   const onChangeRef = useRef(onChange);
    //  const disabledRef = useRef(disabled);
    //   const onReadyRef = useRef(onReady);

    // force editor props to be immutable
    const propsRef = useRef({
      ...props,
      disabled,
      onChange,
      onReady,
    });

    useLayoutEffect(() => {
      const instance = new Editor({
        // editable: !disabledRef.current,
        editable: !propsRef.current.disabled,
        extensions: [
          StarterKit.configure({
            heading: false,
            blockquote: false,
          }),
          Link.configure({
            openOnClick: false,
          }),
          Placeholder.configure({
            // placeholder: props.placeholder || "Write a comment…",
            placeholder: propsRef.current.placeholder || "Write a comment…",
            showOnlyWhenEditable: true,
          }),
        ],
        content: "",
        editorProps: {
          attributes: {
            class: "",
            spellCheck: "true",
          },
        },
        onUpdate({ editor }) {
          // onChangeRef.current?.(editor);
          propsRef.current.onChange?.(editor);
        },
      });

      editorRef.current = instance;
      setEditor(instance);
      // onReadyRef.current?.(instance);
      propsRef.current.onReady?.(instance);

      return () => {
        instance.destroy();
        editorRef.current = null;
      };
    }, []);

    useLayoutEffect(() => {
      if (!editor) return;
      editor.setEditable(!disabled);
    }, [disabled, editor]);

    if (!editor) {
      // placeholder render until Tiptap's render of the editor is complete
      return (
        <div {...containerProps} className="_comment-editor px-2 p-1.5 h-19">
          <p {...props.editorProps}>{props.placeholder}</p>
        </div>
      );
    }

    return (
      <div
        {...containerProps}
        ref={ref}
        aria-disabled={disabled}
        className="_comment-editor  border"
      >
        <EditorContent
          editor={editor}
          {...props.editorProps}
          className="tiptap outline-none! rounded-md"
        />

        <div className="_action-btns flex justify-between">
          <div className="">
            <MarkButton
              editor={editor}
              name="bold"
              icon={<Bold className="size-4" />}
            />
            <MarkButton
              editor={editor}
              name="italic"
              icon={<Italic className="size-4" />}
            />
            <MarkButton
              editor={editor}
              name="strike"
              icon={<Strikethrough className="size-4" />}
            />
            <MarkButton
              editor={editor}
              name="code"
              icon={<Code className="size-4" />}
            />
          </div>
          <div className="_post-action-btn">{children}</div>
        </div>
      </div>
    );
  },
);

export const toggleVariants = cva(
  "inline-flex rounded-md p-1.5 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      active: {
        true: "bg-secondary text-red-500",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

function MarkButton({
  editor,
  name,
  icon,
}: {
  editor: Editor;
  name: string;
  icon: ReactNode;
}): React.ReactNode {
  useHookUpdate(editor);

  return (
    <button
      key={name}
      type="button"
      aria-label={`Toggle ${name}`}
      className={cn(
        toggleVariants({
          active: editor.isActive(name),
        }),
      )}
      disabled={!editor.can().toggleMark(name) || !editor.isEditable}
      onMouseDown={(e) => {
        editor.commands.toggleMark(name);
        e.preventDefault();
      }}
    >
      {icon}
    </button>
  );
}

export function useHookUpdate(editor: Editor): void {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const onUpdate = (): void => {
      forceUpdate((prev) => prev + 1);
    };

    editor.on("transaction", onUpdate);
    return () => {
      editor.off("transaction", onUpdate);
    };
  }, [editor]);
}
