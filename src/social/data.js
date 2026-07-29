const PROFILE = {
  name: "Ritik Yadav",
  handle: "@ritik",
  title: "Builder · ritikyadav.us",
  bio: "Making clear products and calm corners of the internet. Projects, notes, and conversations welcome.",
  location: "On the web",
  joined: "Joined July 2026",
  // Update these hrefs with your real profile URLs anytime.
  socials: [
    { id: "github", label: "GitHub", href: "https://github.com/Rickymorty7x" },
    { id: "x", label: "X", href: "https://x.com/" },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
    { id: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
    { id: "email", label: "Email", href: "mailto:hello@ritikyadav.us" },
    { id: "website", label: "Website", href: "https://ritikyadav.us" },
  ],
  links: [
    { label: "Website", href: "https://ritikyadav.us" },
    { label: "GitHub", href: "https://github.com/Rickymorty7x" },
    { label: "Email", href: "mailto:hello@ritikyadav.us" },
  ],
  stats: [
    { label: "Posts", value: 3 },
    { label: "Projects", value: 2 },
    { label: "Focus", value: "Build" },
  ],
};

const INITIAL_POSTS = [
  {
    id: "site-live",
    author: PROFILE.name,
    handle: PROFILE.handle,
    time: "Jul 28",
    text: "ritikyadav.us is live — About, Works, Social, and Contact. A quiet base to grow from.",
    tags: ["launch", "personal-site"],
    reactions: { like: 12, fire: 4, idea: 6 },
  },
  {
    id: "email-routing",
    author: PROFILE.name,
    handle: PROFILE.handle,
    time: "Jul 28",
    text: "hello@ritikyadav.us now routes through Cloudflare. Prefer the Contact page if you want to write.",
    tags: ["email", "cloudflare"],
    reactions: { like: 8, fire: 2, idea: 3 },
  },
  {
    id: "building",
    author: PROFILE.name,
    handle: PROFILE.handle,
    time: "Jul 29",
    text: "Building things that feel clear. Next up: more projects on Works, and notes worth pinning here.",
    tags: ["wip"],
    reactions: { like: 15, fire: 7, idea: 5 },
  },
];

const REACTIONS = [
  { key: "like", label: "Like", icon: "♥" },
  { key: "fire", label: "Fire", icon: "✦" },
  { key: "idea", label: "Idea", icon: "◎" },
];

function loadState() {
  try {
    const raw = localStorage.getItem("ry-social-v1");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem("ry-social-v1", JSON.stringify(state));
}

export function getInitialSocialState() {
  const saved = loadState();
  if (saved?.posts) return saved;
  return {
    posts: INITIAL_POSTS,
    mine: {},
  };
}

export function persistSocialState(state) {
  saveState(state);
}

export { PROFILE, REACTIONS, INITIAL_POSTS };
