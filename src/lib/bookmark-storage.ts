import localforage from "localforage";

export type BookmarkOrganizerState = {
  bookmarks: BookmarkEntry[];
  settings: BookmarkSettings;
};

export type BookmarkEntry = {
  id: string;
  url: string;
  title: string;
  folderPath?: string;
  tags?: string[];
  status?: number | null;
  responseTimeMs?: number | null;
  lastCheckedAt?: string;
  faviconUrl?: string;
  aiSuggestedTags?: string[];
  aiSuggestedTitle?: string;
  aiSuggestedFolder?: string;
};

export type BookmarkSettings = {
  concurrency: number;
};

const STORAGE_KEY = "demo:bookmark-organizer";

const fallbackStorage = {
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
};

const store = localforage.createInstance({
  name: "ai-demos",
  storeName: "bookmark-organizer",
});

export async function loadBookmarkState(): Promise<BookmarkOrganizerState | null> {
  try {
    const data = await store.getItem<BookmarkOrganizerState>(STORAGE_KEY);
    return data ?? null;
  } catch {
    return fallbackStorage.get<BookmarkOrganizerState>(STORAGE_KEY);
  }
}

export async function saveBookmarkState(
  state: BookmarkOrganizerState,
): Promise<void> {
  try {
    await store.setItem(STORAGE_KEY, state);
  } catch {
    await fallbackStorage.set(STORAGE_KEY, state);
  }
}
