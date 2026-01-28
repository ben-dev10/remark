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
import { Bold, Code, Italic, LinkIcon, Strikethrough } from "lucide-react";
import { cn } from "@/utils/lib/utils";
import { cva } from "class-variance-authority";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HyperLink } from "./hyper-links";

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

    // force editor props to be immutable
    const propsRef = useRef({
      ...props,
      disabled,
      onChange,
      onReady,
    });

    useLayoutEffect(() => {
      // create a new editor instance
      const instance = new Editor({
        editable: !propsRef.current.disabled,
        extensions: [
          StarterKit.configure({
            heading: false,
            blockquote: false,
          }),
          Link.configure({
            openOnClick: false,
            validate: (url) => {
              return /^https?:\/\//.test(url);
            },
            HTMLAttributes: {
              class: "text-blue-500 hover:underline",
            },
          }),
          Placeholder.configure({
            placeholder: propsRef.current.placeholder || "Write a comment…",
            showOnlyWhenEditable: true,
          }),
        ],
        content: propsRef.current.defaultValue || "",
        editorProps: {
          attributes: {
            class: "",
            spellCheck: "true",
          },
        },
        onUpdate({ editor }) {
          propsRef.current.onChange?.(editor);
        },
      });

      editorRef.current = instance;
      setEditor(instance);
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
        className={cn(
          "_comment-editor border-b-0 p-3 pb-2 border",
          containerProps?.className,
        )}
      >
        <EditorContent
          editor={editor}
          {...props.editorProps}
          className="tiptap outline-none! rounded-md"
        />

        <div className="_btns flex mt-2 items-center justify-between">
          <div className="_markup-btns py-2 flex">
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

            <div className="_divider border-l my-0.5 border-primary/50 mx-2" />
            <InsertLink editor={editor} />
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
        true: "dark:bg-primary/30 bg-primary text-white dark:text-white",
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

function InsertLink({ editor }: { editor: Editor }): React.ReactElement {
  useHookUpdate(editor);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger
        type="button"
        aria-label="Toggle Link"
        className={cn(toggleVariants({ active: editor.isActive("link") }))}
        disabled={!editor.can().setLink({ href: "" }) || !editor.isEditable}
      >
        <LinkIcon className="size-4" />
      </DialogTrigger>
      <DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <DialogTitle>Add Link</DialogTitle>
        <HyperLink
          editor={editor}
          onClose={() => {
            setIsOpen(false);
            editor.commands.focus();
          }}
        />
      </DialogContent>
    </Dialog>
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
