import { useEffect, useMemo, useState } from "react";
import { ProfileTab } from "./components/ProfileTab.jsx";
import { PostsTab } from "./components/PostsTab.jsx";
import { SocialLinks } from "./components/SocialLinks.jsx";
import {
  getInitialSocialState,
  persistSocialState,
  PROFILE,
  REACTIONS,
} from "./data.js";

export function SocialApp() {
  const [tab, setTab] = useState("posts");
  const [state, setState] = useState(getInitialSocialState);
  const [toast, setToast] = useState("");

  useEffect(() => {
    persistSocialState(state);
  }, [state]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const totals = useMemo(() => {
    return state.posts.reduce(
      (sum, post) => {
        REACTIONS.forEach((r) => {
          sum[r.key] = (sum[r.key] || 0) + (post.reactions[r.key] || 0);
        });
        return sum;
      },
      {}
    );
  }, [state.posts]);

  function toggleReaction(postId, key) {
    setState((prev) => {
      const current = prev.mine[postId];
      const posts = prev.posts.map((post) => {
        if (post.id !== postId) return post;
        const reactions = { ...post.reactions };
        if (current === key) {
          reactions[key] = Math.max(0, (reactions[key] || 0) - 1);
        } else {
          if (current) {
            reactions[current] = Math.max(0, (reactions[current] || 0) - 1);
          }
          reactions[key] = (reactions[key] || 0) + 1;
        }
        return { ...post, reactions };
      });
      const mine = { ...prev.mine };
      if (current === key) delete mine[postId];
      else mine[postId] = key;
      return { posts, mine };
    });
  }

  async function sharePost(post) {
    const url = `${window.location.origin}/social.html#${post.id}`;
    const payload = {
      title: `${post.author} on ritikyadav.us`,
      text: post.text,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        setToast("Shared");
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(`${post.text}\n\n${url}`);
      setToast("Link copied");
    } catch {
      setToast("Could not share");
    }
  }

  return (
    <div className="social-app">
      <header className="social-hero">
        <h1 className="page-title">Social</h1>
        <p className="page-lede">
          Posts with reactions and sharing — plus a profile tab for the short version of me.
        </p>
      </header>

      <div className="social-tabs" role="tablist" aria-label="Social sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "posts"}
          className={tab === "posts" ? "is-active" : undefined}
          onClick={() => setTab("posts")}
        >
          Posts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={tab === "profile" ? "is-active" : undefined}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
      </div>

      <div className="social-panel" role="tabpanel">
        {tab === "posts" ? (
          <PostsTab
            posts={state.posts}
            mine={state.mine}
            onReact={toggleReaction}
            onShare={sharePost}
          />
        ) : (
          <ProfileTab totals={totals} postCount={state.posts.length} />
        )}
      </div>

      <section className="social-footer-links" aria-label="Find me online">
        <p className="social-footer-label">Find me on</p>
        <SocialLinks profiles={PROFILE.socials} />
      </section>

      {toast ? (
        <div className="social-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
