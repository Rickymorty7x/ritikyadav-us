import { nanoid } from "nanoid";
import { db, rowToPost } from "./db.js";

export function listPosts({ includeDrafts = false } = {}) {
  const rows = includeDrafts
    ? db
        .prepare("SELECT * FROM posts ORDER BY datetime(created_at) DESC")
        .all()
    : db
        .prepare(
          "SELECT * FROM posts WHERE published = 1 ORDER BY datetime(created_at) DESC"
        )
        .all();
  return rows.map(rowToPost);
}

export function getPost(id) {
  return rowToPost(db.prepare("SELECT * FROM posts WHERE id = ?").get(id));
}

export function createPost({
  author,
  handle,
  text,
  tags = [],
  imageUrl = null,
  published = true,
}) {
  const id = nanoid(10);
  db.prepare(
    `INSERT INTO posts (id, author, handle, text, tags, image_url, published)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    author,
    handle,
    text,
    JSON.stringify(tags),
    imageUrl || null,
    published ? 1 : 0
  );
  return getPost(id);
}

export function updatePost(
  id,
  { text, tags, published, author, handle, imageUrl }
) {
  const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  if (!existing) return null;
  const nextImage =
    imageUrl === undefined ? existing.image_url : imageUrl || null;
  db.prepare(
    `UPDATE posts SET
      text = ?,
      tags = ?,
      published = ?,
      author = ?,
      handle = ?,
      image_url = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    text ?? existing.text,
    JSON.stringify(tags ?? JSON.parse(existing.tags || "[]")),
    published === undefined ? existing.published : published ? 1 : 0,
    author ?? existing.author,
    handle ?? existing.handle,
    nextImage,
    id
  );
  return getPost(id);
}

export function deletePost(id) {
  const info = db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  return info.changes > 0;
}

export function reactToPost(id, key, delta) {
  const col = { like: "likes", fire: "fire", idea: "idea" }[key];
  if (!col) return null;
  const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  if (!existing) return null;
  db.prepare(
    `UPDATE posts SET ${col} = MAX(0, ${col} + ?), updated_at = datetime('now') WHERE id = ?`
  ).run(delta, id);
  return getPost(id);
}
