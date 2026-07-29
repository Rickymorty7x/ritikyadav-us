import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { nanoid } from "nanoid";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = Number(process.env.PORT || 8787);
const ORIGIN = process.env.CORS_ORIGIN || "*";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
      ? ext
      : ".jpg";
    cb(null, `${Date.now()}-${nanoid(8)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

app.use(
  cors({
    origin: ORIGIN === "*" ? true : ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));

function absoluteUploadUrl(req, filename) {
  const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
  return `${String(base).replace(/\/$/, "")}/uploads/${filename}`;
}

function parseTags(input) {
  if (Array.isArray(input)) return input.map(String).map((t) => t.trim()).filter(Boolean);
  return String(input || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

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

app.post("/api/uploads", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image file required" });
  res.status(201).json({
    imageUrl: absoluteUploadUrl(req, req.file.filename),
    filename: req.file.filename,
  });
});

app.post("/api/posts", requireAuth, upload.single("image"), (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Post text is required" });
  const tags = parseTags(req.body?.tags);
  let imageUrl = String(req.body?.imageUrl || "").trim() || null;
  if (req.file) {
    imageUrl = absoluteUploadUrl(req, req.file.filename);
  }
  const post = createPost({
    author: req.body?.author || req.user.display_name,
    handle: req.body?.handle || `@${req.user.username}`,
    text,
    tags,
    imageUrl,
    published: String(req.body?.published || "true") !== "false",
  });
  res.status(201).json({ post });
});

app.put("/api/posts/:id", requireAuth, upload.single("image"), (req, res) => {
  const tags = req.body?.tags !== undefined ? parseTags(req.body.tags) : undefined;
  let imageUrl = req.body?.imageUrl;
  if (req.file) {
    imageUrl = absoluteUploadUrl(req, req.file.filename);
  }
  if (req.body?.clearImage === "1" || req.body?.clearImage === true) {
    imageUrl = null;
  }
  const post = updatePost(req.params.id, {
    text: req.body?.text,
    tags,
    published:
      req.body?.published === undefined
        ? undefined
        : String(req.body.published) !== "false",
    author: req.body?.author,
    handle: req.body?.handle,
    imageUrl,
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
  res.status(400).json({ error: err.message || "Server error" });
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
