import { JSONContent } from "@tiptap/react";

const comment1: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Wow, this ",
        },
        {
          type: "text",
          marks: [
            {
              type: "bold",
            },
          ],
          text: "editor",
        },
        {
          type: "text",
          text: " ",
        },
        {
          type: "text",
          marks: [
            {
              type: "bold",
            },
          ],
          text: "instance",
        },
        {
          type: "text",
          text: " ",
        },
        {
          type: "text",
          marks: [
            {
              type: "italic",
            },
          ],
          text: "exports",
        },
        {
          type: "text",
          text: " its content as JSON.",
        },
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

export const mockData = [
  {
    content: linkComment,
    createdAt: 1769135858910,
    postId: "test-post-1",
    user: {
      avatarUrl:
        "https://ing.clerk.com/eyJ@cXBlIjoiZGVmYXVsdCIsImlp_EN4MWR4aGtQT@xHS25YTkJHcCIsInluaXRpYMxzIjoiVEEifQ",
      username: "testa",
    },
    userId: "jd78k3sf10h60wk5qg1c@cgc8s7zqn9b",
    _creationTime: 1769135858988.4656,
    _id: "j572pc66r76v3zybdk7amk7qrn7zrg@g",
  },
  {
    content: comment1,
    createdAt: 1769135913781,
    postId: "test-post-1",
    user: {
      avatarUrl:
        "https://ing.clerk.com/eyJ@cXBlIjoiZGVmYXVsdCIsImlp_EN4MWR4aGtQT@xHS25YTkJHcCIsImluaXRpYWxzIjoiVEEifQ",
      username: "testa",
    },
    userId: "jd78k3sf10h6@wk5qg1c@cgc857zqn9b",
    _creationTime: 1769135913778.784,
    _id: "j57ctap3tchxz34qwzgympdh1h7zrh11",
  },
];

export const xxxc = JSON.stringify(mockData[0]["content"]);
