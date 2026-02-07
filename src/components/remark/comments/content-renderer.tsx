import type { JSONContent } from "@tiptap/react";
import { type ReactNode, useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/lib/utils";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { CheckIcon, CopyIcon } from "lucide-react";
import { buttonVariants } from "./ui";
import { lowlight } from "@/utils/lib/syntax-highlighter";

interface Mark {
  type: string;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
}

type BaseRenderer = (props: {
  className: string;
  children: ReactNode;
}) => ReactNode;

export const codeVariants = cva(
  "rounded-md border border-border bg-muted p-0.5",
);

export const codeBlockVariants = cva(
  "relative grid rounded-lg border border-border bg-muted/40 p-2 text-sm my-1.5",
);

const defaultRenderer: BaseRenderer = (props) => <span {...props} />;

type Marks = Record<
  string,
  {
    element?: (mark: Mark) => BaseRenderer;
    className?: string;
  }
>;

const marks: Marks = {
  bold: {
    className: "font-bold",
  },
  strike: {
    className: "line-through",
  },
  italic: {
    className: "italic",
  },
  code: {
    className: codeVariants(),
    element: () => (props) => <code {...props} />,
  },
  link: {
    className: "font-medium underline text-blue-400 dark:text-blue-300",
    element(mark) {
      const href = mark.attrs?.href;
      if (typeof href === "string")
        return function Link(props) {
          return (
            <a href={href} rel="noreferrer noopener" {...props}>
              {props.children}
            </a>
          );
        };

      return defaultRenderer;
    },
  },
};

let id = 0;

function renderText(content: JSONContent): ReactNode {
  let Element = defaultRenderer;
  const className: string[] = [];

  for (const mark of content.marks ?? []) {
    if (mark.type in marks) {
      const m = marks[mark.type];

      if (m.className) className.push(m.className);
      if (m.element) Element = m.element(mark);
    }
  }

  return (
    <Element key={id++} className={cn(className)}>
      {content.text}
    </Element>
  );
}

function render(content: JSONContent): ReactNode {
  if (content.type === "text") {
    return renderText(content);
  }

  if (content.type === "codeBlock") {
    return (
      <CodeBlock
        key={id++}
        language={content.attrs?.language as string}
        content={content.content?.[0]?.text ?? ""}
      />
    );
  }

  const joined: ReactNode[] = content.content?.map((child) =>
    render(child),
  ) ?? [" "];

  if (content.type === "paragraph") {
    return <span key={id++}>{joined}</span>;
  }

  if (content.type === "doc") {
    return (
      <div key={id++} className="grid whitespace-pre-wrap wrap-break-word">
        {joined}
      </div>
    );
  }
}

export function ContentRenderer({
  content,
}: {
  content: JSONContent;
}): ReactNode {
  return useMemo(() => render(content), [content]);
}

function CodeBlock({
  language,
  content,
}: {
  language: string;
  content: string;
}) {
  const tree = lowlight.highlight(
    lowlight.registered(language) ? language : "plaintext",
    content,
  );
  const [copied, setCopied] = useState(false);

  return (
    <pre className={cn(codeBlockVariants(), "p-0")}>
      <code className="overflow-auto p-2">
        {toJsxRuntime(tree, { Fragment, jsx, jsxs })}
      </code>
      <button
        type="button"
        className={cn(
          buttonVariants({
            size: "icon",
            variant: "secondary",
          }),
          "absolute right-0.5 top-0.5",
        )}
        onClick={() => {
          navigator.clipboard.writeText(content);
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        }}
      >
        {copied ? (
          <CheckIcon className="size-3" />
        ) : (
          <CopyIcon className="size-3" />
        )}
      </button>
    </pre>
  );
}
