import { deepseek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const InputSchema = z.object({
  bookmarks: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().min(1),
        folderPath: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .min(1),
});

const OutputSchema = z.object({
  items: z.array(
    z.object({
      url: z.string().url(),
      suggestedTitle: z.string().min(1),
      suggestedFolder: z.string().min(1),
      tags: z.array(z.string().min(1)).min(1),
    }),
  ),
});

export async function POST(request: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "Missing DEEPSEEK_API_KEY" },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = InputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { bookmarks } = parsed.data;

  const result = await generateObject({
    model: deepseek("deepseek-chat"),
    schema: OutputSchema,
    system:
      "You are a bookmark organizer. Output structured folder path, tags, and rename suggestions.",
    prompt: `Organize these bookmarks.\n\nRequirements:\n- Use folder paths with '/' separators (e.g. 'Tech/AI').\n- Provide 2-5 concise tags per item.\n- Suggested title should be concise and human-readable.\n- Keep URLs unchanged.\n\nBookmarks:\n${JSON.stringify(
      bookmarks,
      null,
      2,
    )}`,
  });

  return NextResponse.json(result.object);
}
