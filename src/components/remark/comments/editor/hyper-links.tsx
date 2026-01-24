import type { Editor } from "@tiptap/react";
import { useLayoutEffect, useState } from "react";
import { cn } from "@/utils/lib/utils";
import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "appearance-none px-2 py-1.5 placeholder:text-fc-muted-foreground focus-visible:outline-none",
  {
    variants: {
      variant: {
        ghost: "px-4 py-3.5 border-b",
        default:
          "rounded-md border border-fc-border bg-fc-background focus-visible:ring-2 focus-visible:ring-fc-ring",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium cursor-pointer disabled:pointer-events-none disabled:bg-fc-muted disabled:text-fc-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-ring",
  {
    variants: {
      size: {
        small: "h-8 px-2 text-xs",
        medium: "px-3 py-2 text-sm",
        default: "h-8 min-w-20 text-sm",
        icon: "size-7 rounded-full",
      },
      variant: {
        primary:
          "bg-fc-primary text-fc-primary-foreground transition-colors hover:bg-fc-primary/80",
        secondary:
          "border border-fc-border bg-fc-card transition-colors hover:bg-fc-accent",
        ghost: "transition-colors hover:bg-fc-accent/80",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export function HyperLink({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}): React.ReactElement {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const isInsert = editor.state.selection.empty;

  useLayoutEffect(() => {
    editor.commands.extendMarkRange("link");

    const href = editor.getAttributes("link").href as string | undefined;
    const selection = editor.state.selection;
    const selected = editor.state.doc.textBetween(selection.from, selection.to);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(selected);
    setValue(href ?? "");
  }, [editor]);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (value.trim().length === 0) return;
        const content = name.length > 0 ? name : value;

        onClose();
        if (!editor.state.selection.empty) {
          editor
            .chain()
            .deleteSelection()
            .setLink({ href: value })
            .insertContent(content)
            .focus()
            .run();
        } else {
          editor
            .chain()
            .setLink({ href: value })
            .insertContent(content)
            .unsetMark("link")
            .insertContent(" ")
            .focus()
            .run();
        }
      }}
    >
      <label className="font-medium text-sm content-center" htmlFor="url">
        Link
      </label>
      <input
        id="url"
        className={cn(inputVariants(), "mb-2")}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        placeholder="https://example.com"
        required
        type="url"
        value={value}
      />
      <label className="font-medium text-sm content-center" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        className={cn(inputVariants(), "mb-2")}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        placeholder="My Link (optional)"
      />
      <div className="flex gap-1 mt-2">
        <button className={cn(buttonVariants())} type="submit">
          {isInsert ? "Insert" : "Save"}
        </button>
        {editor.isActive("link") ? (
          <button
            className={cn(buttonVariants({ variant: "secondary" }))}
            onClick={() => {
              onClose();
              editor.chain().focus().unsetMark("link").run();
            }}
            type="button"
          >
            Unset
          </button>
        ) : null}
      </div>
    </form>
  );
}
