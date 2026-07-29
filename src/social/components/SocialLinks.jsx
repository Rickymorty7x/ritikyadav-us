const ICONS = {
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 7.5c.85 0 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.80-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10.27 10.27 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.24 3H21l-6.52 7.45L22 21h-6.17l-4.83-6.31L5.35 21H2.58l6.97-7.97L2 3h6.33l4.36 5.78L18.24 3Zm-2.16 16.2h1.71L7.99 4.7H6.15l9.93 14.5Z"
      />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3.5 9.75h3V21h-3V9.75ZM9.75 9.75h2.87v1.54h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V21h-3v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-1.96 1.33-1.96 2.7V21h-3V9.75Z"
      />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm11.25 1.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 8.2A3.8 3.8 0 1 1 12 15.8 3.8 3.8 0 0 1 12 8.2Zm0 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"
      />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.5 5.5h17A1.5 1.5 0 0 1 22 7v10a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17V7a1.5 1.5 0 0 1 1.5-1.5Zm0 2.1V17h17V7.6l-8.1 5.1a1 1 0 0 1-1.05 0L3.5 7.6Zm1.2-1.1 7.05 4.45a.5.5 0 0 0 .5 0L19.3 6.5H4.7Z"
      />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 0 0-6.32 12.9c.5-.64 1.45-1.4 2.82-1.4h.2c.9 0 1.4.35 1.4 1.1v.4c0 .55.2 1 .7 1.25.7.35 1.55-.15 2.2-.95.4-.5 1-.8 1.7-.8h.5c1.5 0 2.3 1.15 2.3 2.35v.15A8 8 0 0 0 12 4Zm0 2c1.3 0 2.45.55 3.25 1.4-.35.2-.75.35-1.2.35h-.4C12.7 7.75 12 8.35 12 9.2v.35c0 1.15-.7 2.1-1.8 2.45-.35.1-.7.4-.7.85 0 .2.05.4.2.55-.95.15-1.75.7-2.25 1.45A7.96 7.96 0 0 1 12 6Z"
      />
    </svg>
  ),
};

export function SocialLinks({ profiles, compact = false }) {
  return (
    <nav
      className={`social-icons ${compact ? "is-compact" : ""}`}
      aria-label="Social media profiles"
    >
      {profiles.map((profile) => (
        <a
          key={profile.id}
          className="social-icon"
          href={profile.href}
          target={profile.href.startsWith("http") ? "_blank" : undefined}
          rel={profile.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={profile.label}
          title={profile.label}
        >
          {ICONS[profile.id] || ICONS.website}
          <span className="social-icon-label">{profile.label}</span>
        </a>
      ))}
    </nav>
  );
}
