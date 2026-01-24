"use client";
import { cn } from "@/utils/lib/utils";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { generateHTML, JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import Link from "@tiptap/extension-link";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strikethrough from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";

interface ContentRendererProps {
  // content can be stored as a stringified TipTap JSON in the DB or as JSON
  content: JSONContent | string | null | undefined;
  className?: string;
}

export default function ContentRenderer({
  content,
  className,
}: ContentRendererProps) {
  const output = useMemo(() => {
    // handle empty or invalid content
    if (!content) return "<p></p>";

    // If content is a string, try to parse it as JSON
    let parsed: JSONContent | unknown = content;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        console.error("Failed to parse comment content JSON:", err, content);
        return "<p></p>";
      }
    }

    // ensure content has the proper structure
    let normalizedContent: JSONContent;
    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      typeof (parsed as Record<string, unknown>).type === "string"
    ) {
      normalizedContent = parsed as JSONContent;
    } else if (Array.isArray(parsed)) {
      normalizedContent = { type: "doc", content: parsed as JSONContent[] };
    } else {
      normalizedContent = { type: "doc", content: [parsed as JSONContent] };
    }

    try {
      return generateHTML(normalizedContent, [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Strikethrough,
        Code,
        Link.configure({
          openOnClick: true,
          // only allow http/https links
          validate: (url) => /^https?:\/\//i.test(url),
          HTMLAttributes: {
            class: "text-blue-600 hover:underline",
            rel: "noopener noreferrer nofollow", // prevent tab-nabbing
            target: "_blank",
          },
        }),
      ]);
    } catch (error) {
      console.error("Error rendering content:", error, parsed);
      return "<p>Error</p>";
    }
  }, [content]);

  return (
    <div
      className={cn("_tiptap-content", className)}
      dangerouslySetInnerHTML={{ __html: output }}
    />
  );
}
