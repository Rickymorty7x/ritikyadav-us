import { REACTIONS } from "../data.js";

export function PostsTab({ posts, mine, onReact, onShare }) {
  return (
    <div className="post-feed">
      {posts.map((post, index) => (
        <article
          key={post.id}
          id={post.id}
          className="post"
          style={{ animationDelay: `${0.08 + index * 0.06}s` }}
        >
          <div className="post-top">
            <div className="avatar" aria-hidden="true">
              RY
            </div>
            <div className="post-meta">
              <div className="post-identity">
                <strong>{post.author}</strong>
                <span>{post.handle}</span>
              </div>
              <time>{post.time}</time>
            </div>
          </div>

          <p className="post-text">{post.text}</p>

          {post.tags?.length ? (
            <ul className="post-tags">
              {post.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}

          <div className="post-actions">
            <div className="reaction-row" aria-label="Reactions">
              {REACTIONS.map((reaction) => {
                const active = mine[post.id] === reaction.key;
                const count = post.reactions[reaction.key] || 0;
                return (
                  <button
                    key={reaction.key}
                    type="button"
                    className={`reaction ${active ? "is-active" : ""}`}
                    aria-pressed={active}
                    aria-label={`${reaction.label}, ${count}`}
                    onClick={() => onReact(post.id, reaction.key)}
                  >
                    <span className="reaction-icon">{reaction.icon}</span>
                    <span className="reaction-label">{reaction.label}</span>
                    <span className="reaction-count">{count}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="share-btn"
              onClick={() => onShare(post)}
            >
              Share
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 8h8M8 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
