import express from "express";
import cors from "cors";
import {
  createSession,
  createUser,
  destroySession,
  findUserByUsername,
  getSessionUser,
  requireAuth,
  verifyPassword,
} from "./auth.js";
import { db } from "./db.js";
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  reactToPost,
  updatePost,
} from "./posts.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: ORIGIN === "*" ? true : ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ritikyadav-api" });
});

app.post("/api/auth/login", (req, res) => {
  const username = String(req.body?.username || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const session = createSession(user.id);
  res.json({
    token: session.token,
    expiresAt: session.expiresAt,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    },
  });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  destroySession(req.token);
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.display_name,
    },
  });
});

app.get("/api/posts", (req, res) => {
  if (req.query.all === "1") {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!getSessionUser(token)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.json({ posts: listPosts({ includeDrafts: true }) });
  }
  res.json({ posts: listPosts() });
});

app.get("/api/posts/:id", (req, res) => {
  const post = getPost(req.params.id);
  if (!post || !post.published) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json({ post });
});

app.post("/api/posts", requireAuth, (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Post text is required" });
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map(String)
    : String(req.body?.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
  const post = createPost({
    author: req.body?.author || req.user.display_name,
    handle: req.body?.handle || `@${req.user.username}`,
    text,
    tags,
    published: req.body?.published !== false,
  });
  res.status(201).json({ post });
});

app.put("/api/posts/:id", requireAuth, (req, res) => {
  const tags = req.body?.tags
    ? Array.isArray(req.body.tags)
      ? req.body.tags.map(String)
      : String(req.body.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
    : undefined;
  const post = updatePost(req.params.id, {
    text: req.body?.text,
    tags,
    published: req.body?.published,
    author: req.body?.author,
    handle: req.body?.handle,
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ post });
});

app.delete("/api/posts/:id", requireAuth, (req, res) => {
  const ok = deletePost(req.params.id);
  if (!ok) return res.status(404).json({ error: "Post not found" });
  res.json({ ok: true });
});

app.post("/api/posts/:id/react", (req, res) => {
  const key = String(req.body?.key || "");
  const delta = Number(req.body?.delta || 0);
  if (!["like", "fire", "idea"].includes(key) || ![-1, 1].includes(delta)) {
    return res.status(400).json({ error: "Invalid reaction" });
  }
  const post = reactToPost(req.params.id, key, delta);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ post });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

export function ensureSeedAdmin() {
  const username = (process.env.ADMIN_USERNAME || "ritik").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMeNow!2026";
  const displayName = process.env.ADMIN_DISPLAY_NAME || "Ritik Yadav";
  let user = findUserByUsername(username);
  if (!user) {
    user = createUser({ username, password, displayName });
    console.log(`Created admin user "${username}"`);
  }
  const count = db.prepare("SELECT COUNT(*) AS c FROM posts").get().c;
  if (count === 0) {
    createPost({
      author: displayName,
      handle: `@${username}`,
      text: "ritikyadav.us is live — About, Works, Social, and Contact. A quiet base to grow from.",
      tags: ["launch", "personal-site"],
    });
    createPost({
      author: displayName,
      handle: `@${username}`,
      text: "hello@ritikyadav.us now routes through Cloudflare. Prefer the Contact page if you want to write.",
      tags: ["email", "cloudflare"],
    });
    createPost({
      author: displayName,
      handle: `@${username}`,
      text: "Building things that feel clear. Next up: more projects on Works, and notes worth pinning here.",
      tags: ["wip"],
    });
    console.log("Seeded starter posts");
  }
  return { username };
}

ensureSeedAdmin();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
