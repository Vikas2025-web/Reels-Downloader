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
  process.env["RAPIDAPI_HOST"] ?? "instagram120.p.rapidapi.com";

const PROVIDER_NAME = "RapidAPI / instagram120";

function isConfigured(): boolean {
  return Boolean(RAPIDAPI_KEY);
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

async function rapidPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  if (!RAPIDAPI_KEY) {
    throw new ProviderError(
      503,
      "Downloader provider not configured. Set RAPIDAPI_KEY in environment to enable downloads.",
    );
  }
  const r = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  if (!r.ok) {
    const msg =
      (parsed as { message?: string })?.message ??
      `Provider error ${r.status}`;
    throw new ProviderError(
      r.status === 404 ? 404 : r.status === 401 || r.status === 403 ? 503 : 502,
      msg,
      text.slice(0, 400),
    );
  }
  return parsed;
}

function sendError(res: Response, status: number, error: string, details?: string) {
  res.status(status).json(details ? { error, details } : { error });
}

function handleProviderError(req: Request, res: Response, e: unknown) {
  if (e instanceof ProviderError) {
    return sendError(res, e.status, e.message, e.details);
  }
  req.log?.error({ err: e }, "Instagram provider error");
  return sendError(res, 500, "Unexpected error fetching from provider.");
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

// ---------- /instagram/reel — by URL ----------
router.post("/instagram/reel", async (req: Request, res: Response) => {
  const parsed = FetchReelBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request body.");
  const url = parsed.data.url.trim();
  if (!/instagram\.com\//i.test(url)) {
    return sendError(res, 400, "Please enter a valid instagram.com URL.");
  }
  try {
    const raw = await rapidPost("/api/instagram/links", { url });
    const out = mapLinksResponse(raw);
    if (!out.media.length) {
      return sendError(
        res,
        404,
        "Could not extract any media from that link. The post may be private or removed.",
      );
    }
    res.json(out);
  } catch (e) {
    return handleProviderError(req, res, e);
  }
});

function mapLinksResponse(raw: unknown): {
  shortcode: string;
  username?: string;
  userFullName?: string;
  userAvatar?: string;
  caption?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  takenAt?: string;
  media: Array<Record<string, unknown>>;
} {
  const arr = Array.isArray(raw) ? raw : [];
  const first = (arr[0] ?? {}) as Record<string, unknown>;
  const meta = (first["meta"] ?? {}) as Record<string, unknown>;
  const urls = Array.isArray(first["urls"])
    ? (first["urls"] as Array<Record<string, unknown>>)
    : [];

  const media = urls
    .map((u) => {
      const url = u["url"] as string | undefined;
      if (!url) return undefined;
      const ext = ((u["extension"] as string | undefined) ?? "").toLowerCase();
      const name = ((u["name"] as string | undefined) ?? "").toLowerCase();
      const isVideo =
        ext === "mp4" || ext === "mov" || name.includes("mp4") || name.includes("video");
      return {
        type: isVideo ? "video" : "image",
        url,
        thumbnail: undefined as string | undefined,
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  return {
    shortcode: (meta["shortcode"] as string | undefined) ?? "media",
    caption: meta["title"] as string | undefined,
    likeCount: meta["likeCount"] as number | undefined,
    commentCount: meta["commentCount"] as number | undefined,
    takenAt: toIso(meta["takenAt"]),
    media,
  };
}

// ---------- /instagram/stories — by username ----------
router.post("/instagram/stories", async (req: Request, res: Response) => {
  const parsed = FetchStoriesBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request body.");
  const username = normalizeUsername(parsed.data.username);
  if (!username || !/^[a-zA-Z0-9._]{1,40}$/.test(username)) {
    return sendError(res, 400, "Please enter a valid Instagram username.");
  }
  try {
    const [storiesRaw, profileRaw] = await Promise.all([
      rapidPost("/api/instagram/stories", { username }),
      rapidPost("/api/instagram/profile", { username }).catch(() => null),
    ]);
    const items = Array.isArray((storiesRaw as { result?: unknown })?.result)
      ? ((storiesRaw as { result: unknown[] }).result as unknown[])
      : [];
    const stories = items
      .map((it) => mapStoryItem(it))
      .filter((s): s is Record<string, unknown> => Boolean(s));
    if (!stories.length) {
      return sendError(
        res,
        404,
        "No active stories found for this user, or the account is private.",
      );
    }
    const profile = (profileRaw as { result?: Record<string, unknown> } | null)?.result;
    res.json({
      username:
        (profile?.["username"] as string | undefined) ?? username,
      userFullName: profile?.["full_name"] as string | undefined,
      userAvatar:
        (profile?.["profile_pic_url_hd"] as string | undefined) ??
        (profile?.["profile_pic_url"] as string | undefined),
      stories,
    });
  } catch (e) {
    return handleProviderError(req, res, e);
  }
});

function mapStoryItem(it: unknown): Record<string, unknown> | undefined {
  if (!it || typeof it !== "object") return undefined;
  const item = it as Record<string, unknown>;
  const videoVersions = item["video_versions"] as
    | Array<{ url?: string; width?: number; height?: number }>
    | undefined;
  const candidates =
    (item["image_versions2"] as { candidates?: Array<{ url?: string; width?: number; height?: number }> } | undefined)
      ?.candidates ?? [];

  const isVideo = Array.isArray(videoVersions) && videoVersions.length > 0;
  let url: string | undefined;
  if (isVideo) {
    url = videoVersions![0]?.url;
  }
  if (!url) {
    url = candidates[0]?.url;
  }
  if (!url) return undefined;
  const thumb = candidates[0]?.url;
  const id =
    ((item["pk"] ?? item["id"]) as string | number | undefined)?.toString() ??
    Math.random().toString(36).slice(2);
  return {
    id,
    type: isVideo ? "video" : "image",
    url,
    thumbnail: thumb,
    takenAt: toIso(item["taken_at"]),
  };
}

// ---------- /instagram/profile — by username ----------
router.post("/instagram/profile", async (req: Request, res: Response) => {
  const parsed = FetchProfileBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid request body.");
  const username = normalizeUsername(parsed.data.username);
  if (!username || !/^[a-zA-Z0-9._]{1,40}$/.test(username)) {
    return sendError(res, 400, "Please enter a valid Instagram username.");
  }
  try {
    const raw = await rapidPost("/api/instagram/profile", { username });
    const result = (raw as { result?: Record<string, unknown> })?.result;
    if (!result) {
      return sendError(res, 404, "Profile not found.");
    }
    res.json(mapProfile(result, username));
  } catch (e) {
    return handleProviderError(req, res, e);
  }
});

function mapProfile(u: Record<string, unknown>, username: string): Record<string, unknown> {
  const followers = (
    (u["edge_followed_by"] as { count?: number } | undefined) ??
    (u["followers"] as { count?: number } | undefined)
  )?.count;
  const following = (
    (u["edge_follow"] as { count?: number } | undefined) ??
    (u["following"] as { count?: number } | undefined)
  )?.count;
  const posts = (u["edge_owner_to_timeline_media"] as { count?: number } | undefined)?.count;
  return {
    username: (u["username"] as string | undefined) ?? username,
    fullName: (u["full_name"] as string | undefined) ?? "",
    biography: u["biography"] as string | undefined,
    avatar:
      (u["profile_pic_url_hd"] as string | undefined) ??
      (u["profile_pic_url"] as string | undefined) ??
      "",
    avatarHd: u["profile_pic_url_hd"] as string | undefined,
    isPrivate: u["is_private"] as boolean | undefined,
    isVerified: u["is_verified"] as boolean | undefined,
    followerCount: followers,
    followingCount: following,
    postCount: posts ?? (u["media_count"] as number | undefined),
    externalUrl: u["external_url"] as string | undefined,
  };
}

export default router;
