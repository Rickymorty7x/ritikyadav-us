import { useEffect, useState } from "react";
import { apiFetch } from "../shared/api.js";

const TOKEN_KEY = "ry-admin-token";

export function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("ritik");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    apiFetch("/api/auth/me", { token })
      .then((data) => {
        setUser(data.user);
        return refreshPosts(token);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function refreshPosts(activeToken = token) {
    const data = await apiFetch("/api/posts?all=1", { token: activeToken });
    setPosts(data.posts || []);
  }

  async function onLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setPassword("");
      setNotice("Signed in");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST", token });
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setPosts([]);
  }

  async function onCreate(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append(
        "tags",
        tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",")
      );
      if (imageFile) formData.append("image", imageFile);
      const hadImage = Boolean(imageFile);
      await apiFetch("/api/posts", {
        method: "POST",
        token,
        formData,
      });
      setText("");
      setTags("");
      setImageFile(null);
      setNotice(hadImage ? "Post published with picture" : "Post published");
      await refreshPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this post?")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/posts/${id}`, { method: "DELETE", token });
      setNotice("Post deleted");
      await refreshPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="admin-app">
        <h1 className="page-title">Admin</h1>
        <p className="page-lede">Sign in to manage Social posts.</p>
        <form className="admin-card" onSubmit={onLogin}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button className="button" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <div className="admin-top">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="page-lede">Signed in as {user.displayName} (@{user.username})</p>
        </div>
        <button className="button button-quiet" type="button" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <form className="admin-card" onSubmit={onCreate}>
        <h2>New post</h2>
        <label>
          Text
          <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={5} />
        </label>
        <label>
          Tags (comma separated)
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="launch, update" />
        </label>
        <label className="image-field">
          Picture
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </label>
        {imagePreview ? (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected preview" />
            <button type="button" className="danger" onClick={() => setImageFile(null)}>
              Remove picture
            </button>
          </div>
        ) : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {notice ? <p className="admin-notice">{notice}</p> : null}
        <button className="button" type="submit" disabled={busy}>
          {busy ? "Publishing…" : "Publish post"}
        </button>
      </form>

      <section className="admin-list">
        <h2>All posts</h2>
        {posts.length === 0 ? <p className="admin-empty">No posts yet.</p> : null}
        {posts.map((post) => (
          <article key={post.id} className="admin-post">
            <div className="admin-post-meta">
              <strong>{post.time}</strong>
              <span>{post.published ? "Published" : "Draft"}</span>
            </div>
            <p>{post.text}</p>
            {post.imageUrl ? (
              <img className="admin-post-image" src={post.imageUrl} alt="" />
            ) : null}
            <div className="admin-post-actions">
              <span>
                ♥ {post.reactions.like} · ✦ {post.reactions.fire} · ◎ {post.reactions.idea}
              </span>
              <button type="button" className="danger" onClick={() => onDelete(post.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
