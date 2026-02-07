import { JSONContent } from "@tiptap/react";

export default function parseTipTapContent(content: JSONContent): JSONContent {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return {
        type: "doc",
        content: [],
      };
    }
  }
  return content;
}
