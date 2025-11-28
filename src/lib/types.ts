export type Locale = "en" | "zh";

export type DemoType = "html" | "react";

export type AIModel =
  | "gpt-4o"
  | "gpt-4-turbo"
  | "claude-3-5-sonnet"
  | "gemini-pro"
  | "deepseek-v2";

export type AIAgent =
  | "cursor"
  | "vscode"
  | "v0"
  | "bolt"
  | "windsurf"
  | "chatgpt-web";

export interface AIData {
  model: AIModel;
  agent: AIAgent;
  provider?: string;
  temperature?: number;
}

export interface PromptData {
  main: string;
  system?: string;
  iteration?: string;
}

export type LocalizedText =
  | string
  | {
      en: string;
      zh?: string;
    };

export interface DemoMeta {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  type: DemoType;
  ai: AIData;
  prompt: PromptData;
  tags: string[];
  createdAt: string;
  version?: string;
}

export interface DemoContent {
  code: string;
  entry: "/index.html" | "/App.tsx";
}

export interface Demo extends DemoMeta, DemoContent {}

export interface DemoSummary {
  slug: string;
  title: string;
  description?: string;
  type: DemoType;
  tags: string[];
  ai: Pick<AIData, "model" | "agent">;
  createdAt: string;
}

export interface GetAllDemosOptions {
  locale?: Locale;
  withContent?: boolean;
}

export interface SearchIndexEntry {
  slug: string;
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: DemoType;
  ai: {
    model: AIModel;
    agent: AIAgent;
  };
  contentSnippet?: string;
  updatedAt?: string;
}

export interface SearchIndex {
  version: string;
  generatedAt: string;
  entries: SearchIndexEntry[];
}

export type FilterCriteria = {
  query?: string;
  model?: AIModel;
  agent?: AIAgent;
  tags?: string[];
  type?: DemoType;
};
