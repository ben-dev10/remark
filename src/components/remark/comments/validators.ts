import { Editor, JSONContent } from "@tiptap/react";

// validate comment content
export function validateCommentContent(
  editor: Editor,
  maxCharacters: number,
): {
  isValid: boolean;
  error?: string;
} {
  if (!editor || editor.isEmpty) {
    return { isValid: false, error: "Comment cannot be empty" };
  }

  // get text content (excluding formatting/whitespace for character count)
  const text = editor.getText().trim();
  const charCount = text.length;

  if (charCount === 0) {
    return { isValid: false, error: "Comment cannot be empty" };
  }

  if (charCount > maxCharacters) {
    return {
      isValid: false,
      error: `Comment is too long. Maximum ${maxCharacters} characters allowed (currently ${charCount})`,
    };
  }

  // validate links
  const json = editor.getJSON();
  const hasInvalidLinks = checkForInvalidLinks(json);

  if (hasInvalidLinks) {
    return {
      isValid: false,
      error:
        "Invalid URL detected. Only http:// and https:// links are allowed",
    };
  }

  return { isValid: true };
}

// recursively check for invalid links in content
function checkForInvalidLinks(content: JSONContent): boolean {
  if (!content) return false;

  // check if current node is a text node with link mark
  if (content.marks) {
    for (const mark of content.marks) {
      if (mark.type === "link" && mark.attrs?.href) {
        const href = mark.attrs.href;
        // block javascript:, data:, and other dangerous protocols
        if (!/^https?:\/\//i.test(href)) {
          return true;
        }
      }
    }
  }

  if (content.content && Array.isArray(content.content)) {
    for (const child of content.content) {
      if (checkForInvalidLinks(child)) {
        return true;
      }
    }
  }

  return false;
}
