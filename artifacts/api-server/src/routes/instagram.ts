import { Router, type IRouter, type Request, type Response } from "express";
import {
  FetchReelBody,
  FetchStoriesBody,
  FetchProfileBody,
  ProviderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const RAPIDAPI_KEY = process.env["RAPIDAPI_KEY"];
const RAPIDAPI_HOST =
  process.env["RAPIDAPI_HOST"] ?? "instagram-scraper-api2.p.rapidapi.com";

const PROVIDER_NAME = "RapidAPI / instagram-scraper-api2";

function isConfigured(): boolean {
  return Boolean(RAPIDAPI_KEY);
}

async function rapidGet(
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  if (!RAPIDAPI_KEY) {
    throw new ProviderError(
      503,
      "Downloader provider not configured. Set RAPIDAPI_KEY in environment to enable downloads.",
    );
  }
  const qs = new URLSearchParams(params).toString();
  const url = `https://${RAPIDAPI_HOST}${path}?${qs}`;
  const r = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new ProviderError(
      r.status === 404 ? 404 : 502,
      `Provider request failed (${r.status}).`,
      text.slice(0, 500),
    );
  }
  return await r.json();
}

class ProviderError extends Error {
  status: number;
  details?: string;
  constructor(status: number, message: string, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function sendError(res: Response, status: number, error: string, details?: string) {
  res.status(status).json(details ? { error, details } : { error });
}

function pick<T = unknown>(obj: unknown, ...keys: string[]): T | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of keys) {
    const v = (obj as Record<string, unknown>)[k];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

function toIso(input: unknown): string | undefined {
  if (typeof input === "number") {
    const ms = input < 1e12 ? input * 1000 : input;
    return new Date(ms).toISOString();
  }
  if (typeof input === "string" && input) return input;
  return undefined;
}

function normalizeUsername(raw: string): string {
  let u = raw.trim();
  if (!u) return u;
  u = u.replace(/^@+/, "");
  const m = u.match(/instagram\.com\/([^/?#]+)/i);
  if (m && m[1]) u = m[1];
  return u.replace(/\/+$/, "");
}

router.get("/instagram/status", (_req, res) => {
  const data = ProviderStatusResponse.parse({
    configured: isConfigured(),
    provider: isConfigured() ? PROVIDER_NAME : undefined,
  });
  res.json(data);
});

router.post("/instagram/reel", async (req: Request, res: Response) => {
  const parsed = FetchReelBody.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid request body.");
  }
  const url = parsed.data.url.trim();
  if (!/instagram\.com\//i.test(url)) {
    return sendError(res, 400, "Please enter a valid instagram.com URL.");
  }
  try {
    const raw = await rapidGet("/v1/post_info", {
      code_or_id_or_url: url,
      include_insights: "true",
    });
    const data = (raw as { data?: unknown })?.data ?? raw;
    const out = mapReel(data);
    res.json(out);
  } catch (e) {
    return handleProviderError(req, res, e);
  }
});

router.post("/instagram/stories", async (req: Request, res: Response) => {
  const parsed = FetchStoriesBody.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid request body.");
  }
  const username = normalizeUsername(parsed.data.username);
  if (!username || !/^[a-zA-Z0-9._]{1,40}$/.test(username)) {
    return sendError(res, 400, "Please enter a valid Instagram username.");
  }
  try {
    const raw = await rapidGet("/v1/stories", {
      username_or_id_or_url: username,
    });
    const data = (raw as { data?: unknown })?.data ?? raw;
    const out = mapStories(data, username);
    if (!out.stories.length) {
      return sendError(
        res,
        404,
        "No active stories found for this user, or the account is private.",
      );
    }
    res.json(out);
  } catch (e) {
    return handleProviderError(req, res, e);
  }
});

router.post("/instagram/profile", async (req: Request, res: Response) => {
  const parsed = FetchProfileBody.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid request body.");
  }
  const username = normalizeUsername(parsed.data.username);
  if (!username || !/^[a-zA-Z0-9._]{1,40}$/.test(username)) {
    return sendError(res, 400, "Please enter a valid Instagram username.");
  }
  try {
    const raw = await rapidGet("/v1/info", {
      username_or_id_or_url: username,
    });
    const data = (raw as { data?: unknown })?.data ?? raw;
    const out = mapProfile(data, username);
    if (!out.username) {
      return sendError(res, 404, "Profile not found.");
    }
    res.json(out);
  } catch (e) {
    return handleProviderError(req, res, e);
  }
});

function handleProviderError(req: Request, res: Response, e: unknown) {
  if (e instanceof ProviderError) {
    return sendError(res, e.status, e.message, e.details);
  }
  req.log?.error({ err: e }, "Instagram provider error");
  return sendError(res, 500, "Unexpected error fetching from provider.");
}

function mapReel(data: unknown): Record<string, unknown> {
  const d = (data ?? {}) as Record<string, unknown>;
  const user = (pick(d, "user", "owner", "author") as Record<string, unknown>) ?? {};
  const shortcode =
    (pick(d, "code", "shortcode", "id") as string | undefined) ?? "unknown";

  const media: Array<Record<string, unknown>> = [];
  const carousel = pick<unknown[]>(d, "carousel_media", "resources", "children");
  if (Array.isArray(carousel) && carousel.length > 0) {
    for (const item of carousel) {
      const m = mapMediaItem(item);
      if (m) media.push(m);
    }
  } else {
    const m = mapMediaItem(d);
    if (m) media.push(m);
  }

  return {
    shortcode,
    username: pick(user, "username") as string | undefined,
    userFullName: pick(user, "full_name", "fullName") as string | undefined,
    userAvatar: pick(user, "profile_pic_url", "profile_pic_url_hd", "avatar") as
      | string
      | undefined,
    caption:
      (pick(d, "caption_text") as string | undefined) ??
      ((pick(d, "caption") as Record<string, unknown> | string | undefined) &&
      typeof pick(d, "caption") === "object"
        ? (pick(pick(d, "caption"), "text") as string | undefined)
        : (pick(d, "caption") as string | undefined)),
    likeCount: pick(d, "like_count", "likes") as number | undefined,
    commentCount: pick(d, "comment_count", "comments") as number | undefined,
    viewCount: pick(d, "play_count", "view_count", "views") as number | undefined,
    takenAt: toIso(pick(d, "taken_at", "taken_at_ts", "taken_at_timestamp")),
    media,
  };
}

function mapMediaItem(item: unknown): Record<string, unknown> | undefined {
  if (!item || typeof item !== "object") return undefined;
  const it = item as Record<string, unknown>;
  const isVideo = Boolean(
    pick(it, "is_video") ??
      pick(it, "video_url") ??
      pick(it, "video_versions"),
  );
  const videoVersions = pick<unknown[]>(it, "video_versions");
  const imageVersions =
    pick<{ items?: unknown[] }>(it, "image_versions2")?.items ??
    pick<unknown[]>(it, "image_versions") ??
    [];

  let url: string | undefined;
  if (isVideo) {
    url =
      (Array.isArray(videoVersions) && videoVersions[0] && typeof videoVersions[0] === "object"
        ? ((videoVersions[0] as Record<string, unknown>)["url"] as string | undefined)
        : undefined) ??
      (pick(it, "video_url") as string | undefined);
  }
  if (!url) {
    url =
      (Array.isArray(imageVersions) &&
      imageVersions[0] &&
      typeof imageVersions[0] === "object"
        ? ((imageVersions[0] as Record<string, unknown>)["url"] as string | undefined)
        : undefined) ??
      (pick(it, "display_url", "thumbnail_url", "image_url") as string | undefined);
  }
  if (!url) return undefined;

  const thumb =
    (Array.isArray(imageVersions) &&
    imageVersions[0] &&
    typeof imageVersions[0] === "object"
      ? ((imageVersions[0] as Record<string, unknown>)["url"] as string | undefined)
      : undefined) ??
    (pick(it, "thumbnail_url", "display_url") as string | undefined);

  return {
    type: isVideo ? "video" : "image",
    url,
    thumbnail: thumb,
    width: pick(it, "original_width", "width") as number | undefined,
    height: pick(it, "original_height", "height") as number | undefined,
    durationSec: pick(it, "video_duration", "duration") as number | undefined,
  };
}

function mapStories(data: unknown, username: string): {
  username: string;
  userFullName?: string;
  userAvatar?: string;
  stories: Array<Record<string, unknown>>;
} {
  const d = (data ?? {}) as Record<string, unknown>;
  const items =
    (pick<unknown[]>(d, "items", "stories", "data")) ??
    (pick<{ items?: unknown[] }>(d, "reel")?.items as unknown[] | undefined) ??
    [];
  const user =
    (pick(d, "user") as Record<string, unknown> | undefined) ??
    ((pick(d, "reel") as Record<string, unknown> | undefined)?.["user"] as
      | Record<string, unknown>
      | undefined) ??
    {};

  const stories: Array<Record<string, unknown>> = [];
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const m = mapMediaItem(item);
      if (!m) continue;
      const id =
        (pick(item, "id", "pk") as string | number | undefined)?.toString() ??
        Math.random().toString(36).slice(2);
      stories.push({
        id,
        type: m["type"],
        url: m["url"],
        thumbnail: m["thumbnail"],
        durationSec: m["durationSec"],
        takenAt: toIso(pick(item, "taken_at", "taken_at_timestamp")),
      });
    }
  }

  return {
    username:
      (pick(user, "username") as string | undefined) ?? username,
    userFullName: pick(user, "full_name", "fullName") as string | undefined,
    userAvatar: pick(user, "profile_pic_url", "profile_pic_url_hd") as
      | string
      | undefined,
    stories,
  };
}

function mapProfile(data: unknown, username: string): Record<string, unknown> {
  const d = (data ?? {}) as Record<string, unknown>;
  const u = (pick(d, "user") as Record<string, unknown> | undefined) ?? d;
  return {
    username: (pick(u, "username") as string | undefined) ?? username,
    fullName: (pick(u, "full_name", "fullName") as string | undefined) ?? "",
    biography: pick(u, "biography", "bio") as string | undefined,
    avatar:
      (pick(u, "profile_pic_url") as string | undefined) ??
      (pick(u, "profile_pic_url_hd") as string | undefined) ??
      "",
    avatarHd: pick(u, "profile_pic_url_hd") as string | undefined,
    isPrivate: pick(u, "is_private") as boolean | undefined,
    isVerified: pick(u, "is_verified") as boolean | undefined,
    followerCount: pick(u, "follower_count", "edge_followed_by") as
      | number
      | undefined,
    followingCount: pick(u, "following_count", "edge_follow") as
      | number
      | undefined,
    postCount: pick(u, "media_count") as number | undefined,
    externalUrl: pick(u, "external_url") as string | undefined,
  };
}

export default router;
