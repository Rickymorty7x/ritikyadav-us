import { PROFILE } from "../data.js";
import { SocialLinks } from "./SocialLinks.jsx";

export function ProfileTab({ totals, postCount }) {
  return (
    <section className="profile-panel">
      <div className="profile-banner" aria-hidden="true" />
      <div className="profile-main">
        <div className="profile-avatar" aria-hidden="true">
          RY
        </div>
        <div className="profile-copy">
          <h2>{PROFILE.name}</h2>
          <p className="profile-handle">{PROFILE.handle}</p>
          <p className="profile-title">{PROFILE.title}</p>
          <p className="profile-bio">{PROFILE.bio}</p>
          <p className="profile-meta">
            <span>{PROFILE.location}</span>
            <span aria-hidden="true">·</span>
            <span>{PROFILE.joined}</span>
          </p>
          <SocialLinks profiles={PROFILE.socials} compact />
        </div>
      </div>

      <dl className="profile-stats">
        <div>
          <dt>Posts</dt>
          <dd>{postCount}</dd>
        </div>
        <div>
          <dt>Likes</dt>
          <dd>{totals.like || 0}</dd>
        </div>
        <div>
          <dt>Fire</dt>
          <dd>{totals.fire || 0}</dd>
        </div>
        <div>
          <dt>Ideas</dt>
          <dd>{totals.idea || 0}</dd>
        </div>
      </dl>

      <div className="profile-links">
        {PROFILE.links.map((link) => (
          <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
