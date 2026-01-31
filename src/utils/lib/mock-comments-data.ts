import { JSONContent } from "@tiptap/react";

export interface MockComment {
  id: string;
  author: string;
  avatar?: string;
  timestamp: Date;
  content: JSONContent;
}

const simpleComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a simple comment with no formatting." },
      ],
    },
  ],
};

const boldComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This comment has " },
        { type: "text", text: "bold text", marks: [{ type: "bold" }] },
        { type: "text", text: " in it." },
      ],
    },
  ],
};

const mixedFormattingComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Great work! I especially liked the " },
        { type: "text", text: "bold approach", marks: [{ type: "bold" }] },
        { type: "text", text: " and the " },
        { type: "text", text: "italic styling", marks: [{ type: "italic" }] },
        { type: "text", text: ". The " },
        { type: "text", text: "code examples", marks: [{ type: "code" }] },
        { type: "text", text: " were helpful too!" },
      ],
    },
  ],
};

const linkComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Check out " },
        {
          type: "text",
          text: "this documentation",
          marks: [
            {
              type: "link",
              attrs: { href: "https://tiptap.dev", target: "_blank" },
            },
          ],
        },
        { type: "text", text: " for more info." },
      ],
    },
  ],
};

const multiParagraphComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is the first paragraph with some thoughts.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "And this is a " },
        { type: "text", text: "second paragraph", marks: [{ type: "bold" }] },
        { type: "text", text: " with more details." },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Finally, a third paragraph to wrap things up!" },
      ],
    },
  ],
};

const strikethroughComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "I think we should " },
        { type: "text", text: "use method A", marks: [{ type: "strike" }] },
        { type: "text", text: " actually, let's go with " },
        { type: "text", text: "method B", marks: [{ type: "bold" }] },
        { type: "text", text: " instead." },
      ],
    },
  ],
};

const complexComment: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Here's my feedback on the " },
        { type: "text", text: "new feature", marks: [{ type: "bold" }] },
        { type: "text", text: ":" },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "The " },
        { type: "text", text: "implementation", marks: [{ type: "italic" }] },
        { type: "text", text: " looks great, but we need to update the " },
        { type: "text", text: "API endpoint", marks: [{ type: "code" }] },
        { type: "text", text: " to handle edge cases." },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "See " },
        {
          type: "text",
          text: "issue #123",
          marks: [
            {
              type: "link",
              attrs: { href: "https://github.com/issue/123", target: "_blank" },
            },
          ],
        },
        { type: "text", text: " for details." },
      ],
    },
  ],
};

// [1]
export const mockThreadedComments = [
  {
    _id: "comment_1",
    _creationTime: 1769135858988,
    postId: "test-post-1",
    userId: "user_abc",
    content: JSON.stringify(simpleComment),
    createdAt: Date.now() - 3600000, // 1 hour ago
    parentCommentId: undefined,
    user: {
      username: "Alice",
      avatarUrl: "https://...",
      clerkId: "user_1",
    },
  },

  {
    _id: "comment_2",
    _creationTime: 1769135913778,
    postId: "test-post-1",
    userId: "user_def",
    content: JSON.stringify(boldComment),
    createdAt: Date.now() - 3000000, // 50 mins ago
    parentCommentId: "comment_1",
    user: {
      username: "Bob",
      avatarUrl: "https://...",
      clerkId: "user_2",
    },
  },

  {
    _id: "comment_3",
    _creationTime: 1769135913779,
    postId: "test-post-1",
    userId: "user_ghi",
    content: JSON.stringify(linkComment),
    createdAt: Date.now() - 1800000, // 30 mins ago
    parentCommentId: "comment_1",
    user: {
      username: "Charlie",
      avatarUrl: "https://...",
      clerkId: "user_3",
    },
  },

  {
    _id: "comment_4",
    _creationTime: 1769135913780,
    postId: "test-post-1",
    userId: "user_jkl",
    content: JSON.stringify(strikethroughComment),
    createdAt: Date.now() - 1200000, // 20 mins ago
    parentCommentId: "comment_2",
    user: {
      username: "David",
      avatarUrl: "https://...",
      clerkId: "user_4",
    },
  },

  {
    _id: "comment_5",
    _creationTime: 1769135913781,
    postId: "test-post-1",
    userId: "user_mno",
    content: JSON.stringify(complexComment),
    createdAt: Date.now() - 600000, // 10 mins ago
    parentCommentId: undefined,
    user: {
      username: "Eve",
      avatarUrl: "https://...",
      clerkId: "user_5",
    },
  },
];

// [2]
export const mockComments: MockComment[] = [
  {
    id: "1",
    author: "Sarah Johnson",
    avatar: "SJ",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    content: simpleComment,
  },
  {
    id: "2",
    author: "Mike Chen",
    avatar: "MC",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    content: boldComment,
  },
  {
    id: "3",
    author: "Emma Davis",
    avatar: "ED",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    content: mixedFormattingComment,
  },
  {
    id: "4",
    author: "Alex Kumar",
    avatar: "AK",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    content: linkComment,
  },
  {
    id: "5",
    author: "Jessica Wong",
    avatar: "JW",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    content: multiParagraphComment,
  },
  {
    id: "6",
    author: "David Lee",
    avatar: "DL",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    content: strikethroughComment,
  },
  {
    id: "7",
    author: "Priya Patel",
    avatar: "PP",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    content: complexComment,
  },
];

// Mock data with threading structure for testing
export const mockCommentsWithReplies: Array<
  MockComment & { parentCommentId?: string }
> = [
  {
    id: "comment_1",
    author: "Sarah Johnson",
    avatar: "SJ",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    content: simpleComment,
  },
  {
    id: "comment_2",
    author: "Mike Chen",
    avatar: "MC",
    timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
    content: boldComment,
    parentCommentId: "comment_1",
  },
  {
    id: "comment_3",
    author: "Emma Davis",
    avatar: "ED",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    content: mixedFormattingComment,
    parentCommentId: "comment_1",
  },
  {
    id: "comment_4",
    author: "Alex Kumar",
    avatar: "AK",
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    content: linkComment,
    parentCommentId: "comment_2",
  },
  {
    id: "comment_5",
    author: "Jessica Wong",
    avatar: "JW",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    content: multiParagraphComment,
  },
  {
    id: "comment_6",
    author: "David Lee",
    avatar: "DL",
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    content: strikethroughComment,
    parentCommentId: "comment_5",
  },
  {
    id: "comment_7",
    author: "Priya Patel",
    avatar: "PP",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    content: complexComment,
  },
];

// Helper function to create new mock comment
export const createMockComment = (
  text: string,
  author = "Test User",
): MockComment => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    author,
    avatar: author
      .split(" ")
      .map((n) => n[0])
      .join(""),
    timestamp: new Date(),
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text }],
        },
      ],
    },
  };
};
