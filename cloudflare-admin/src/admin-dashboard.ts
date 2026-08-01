const navIcon = (body: string): string => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const NAV_ICONS = {
  overview: navIcon('<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>'),
  post: navIcon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>'),
  project: navIcon('<path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h4"/>'),
  blog: navIcon('<path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>'),
  opinion: navIcon('<path d="M21 12a8 8 0 0 1-8 8H5l-3 2 1-5a9 9 0 1 1 18-5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'),
  music: navIcon('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  page: navIcon('<path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5"/>'),
  security: navIcon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'),
  account: navIcon('<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/>'),
};

export const ADMIN_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ritik.us — Admin</title>
  <link rel="stylesheet" href="/admin/style.css">
</head>
<body class="admin-page">
  <div class="admin-shell">
    <aside class="sidebar">
      <a class="brand" href="/" aria-label="Return to website"><span></span>Ritik<span>.us</span></a>
      <div class="sidebar-scroll">
        <p class="nav-label">Manage website</p>
        <nav class="category-nav" aria-label="Content categories">
          <button class="nav-item active" data-view="content" data-type=""><span class="nav-icon">${NAV_ICONS.overview}</span><span>Overview</span><b data-count="all">0</b></button>
          <button class="nav-item" data-view="content" data-type="post"><span class="nav-icon">${NAV_ICONS.post}</span><span>Posts</span><b data-count="post">0</b></button>
          <button class="nav-item" data-view="content" data-type="project"><span class="nav-icon">${NAV_ICONS.project}</span><span>Projects</span><b data-count="project">0</b></button>
          <button class="nav-item" data-view="content" data-type="blog"><span class="nav-icon">${NAV_ICONS.blog}</span><span>Blog</span><b data-count="blog">0</b></button>
          <button class="nav-item" data-view="content" data-type="opinion"><span class="nav-icon">${NAV_ICONS.opinion}</span><span>Opinions</span><b data-count="opinion">0</b></button>
          <button class="nav-item" data-view="content" data-type="music"><span class="nav-icon">${NAV_ICONS.music}</span><span>Music</span><b data-count="music">0</b></button>
          <button class="nav-item" data-view="content" data-type="page"><span class="nav-icon">${NAV_ICONS.page}</span><span>Pages</span><b data-count="page">0</b></button>
        </nav>
        <p class="nav-label system-label">System</p>
        <nav class="system-nav" aria-label="Admin settings">
          <button class="nav-item" data-view="audit"><span class="nav-icon">${NAV_ICONS.security}</span><span>Security log</span></button>
          <button class="nav-item" data-view="account"><span class="nav-icon">${NAV_ICONS.account}</span><span>Account</span></button>
        </nav>
      </div>
      <div class="sidebar-foot">
        <span class="avatar">R</span>
        <span class="owner"><strong id="adminName">Admin</strong><small>Owner</small></span>
        <button id="logoutBtn" class="signout" aria-label="Sign out" title="Sign out">↗</button>
      </div>
    </aside>

    <main class="workspace">
      <header class="workspace-head">
        <div>
          <p class="kicker" id="viewKicker">Personal publishing system</p>
          <h1 id="viewTitle">Website overview</h1>
          <p class="view-description" id="viewDescription">Manage everything visitors can see from one place.</p>
        </div>
        <div class="header-actions">
          <a class="secondary visit-link" href="/" target="_blank" rel="noopener">View website <span>↗</span></a>
          <button class="primary" id="newBtn">Add <span id="newTypeLabel">content</span><b>＋</b></button>
        </div>
      </header>

      <section id="contentView">
        <section class="overview-dashboard" id="overviewDashboard" aria-label="Website analytics and security notifications">
          <div class="overview-grid">
            <article class="panel analytics-panel">
              <div class="panel-head">
                <div><p class="panel-eyebrow">Website analytics</p><h2>Traffic at a glance</h2><p>Private, first-party visitor counts from the last 30 days.</p></div>
                <button class="secondary compact" id="refreshOverview">Refresh</button>
              </div>
              <div class="analytics-metrics">
                <div><span>Views today</span><strong id="todayViews">—</strong><small id="viewsChange">Collecting data</small></div>
                <div><span>Visitors today</span><strong id="todayVisitors">—</strong><small>unique today</small></div>
                <div><span>Last 7 days</span><strong id="sevenDayViews">—</strong><small>page views</small></div>
                <div><span>Last 30 days</span><strong id="thirtyDayViews">—</strong><small>page views</small></div>
              </div>
              <div class="traffic-layout">
                <div><p class="subhead">14-day activity</p><div class="traffic-chart" id="trafficChart" aria-label="Page views over the last 14 days"></div></div>
                <div><p class="subhead">Top pages · 7 days</p><div class="top-pages" id="topPages"></div></div>
              </div>
            </article>

            <article class="panel notification-panel">
              <div class="panel-head">
                <div><p class="panel-eyebrow">Security notifications</p><h2>Protection center <span class="notification-count" id="notificationCount" hidden>0</span></h2><p>Blocked access attempts that may need your attention.</p></div>
                <button class="secondary compact" id="reviewNotifications">Mark reviewed</button>
              </div>
              <div class="security-posture" id="securityPosture">
                <span class="posture-icon">✓</span><div><strong id="postureTitle">Checking protection…</strong><small id="postureText">Loading recent security activity.</small></div>
              </div>
              <div class="notification-list" id="notificationList" aria-live="polite"></div>
              <button class="notification-link" id="openSecurityLog">Open full security log <span>→</span></button>
            </article>
          </div>
        </section>

        <div id="contentManager">
        <div class="stats-grid" aria-label="Content summary">
          <article class="stat-card"><span>All</span><strong id="statAll">0</strong><small>entries</small></article>
          <article class="stat-card published"><span>Published</span><strong id="statPublished">0</strong><small>live now</small></article>
          <article class="stat-card draft"><span>Drafts</span><strong id="statDraft">0</strong><small>in progress</small></article>
          <article class="stat-card archived"><span>Archived</span><strong id="statArchived">0</strong><small>hidden</small></article>
        </div>

        <div class="toolbar">
          <label class="search"><span>⌕</span><input id="searchInput" type="search" placeholder="Search title or slug"></label>
          <select id="statusFilter" aria-label="Filter by status">
            <option value="">Every status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button class="secondary publish-all" id="publishAllBtn">Publish all drafts</button>
        </div>

        <div class="bulk-bar" id="bulkBar" hidden>
          <strong><span id="selectedCount">0</span> selected</strong>
          <button id="clearSelection">Clear</button>
          <span class="bulk-spacer"></span>
          <button class="secondary" id="archiveSelected">Archive</button>
          <button class="primary compact" id="publishSelected">Publish selected</button>
        </div>

        <div class="content-table">
          <div class="table-head">
            <label class="check-wrap"><input id="selectAll" type="checkbox" aria-label="Select every visible entry"><span></span></label>
            <span>Content</span><span>Type</span><span>Status</span><span>Updated</span><span>Actions</span>
          </div>
          <div id="contentList" aria-live="polite"></div>
        </div>
        </div>
      </section>

      <section id="auditView" hidden>
        <div class="panel">
          <div class="panel-head"><div><h2>Security activity</h2><p>Recent sign-ins and content changes.</p></div><button class="secondary" id="refreshAudit">Refresh</button></div>
          <div class="audit-list" id="auditList"></div>
        </div>
      </section>

      <section id="accountView" hidden>
        <div class="panel account-panel">
          <p class="panel-eyebrow">Credentials</p><h2>Change password</h2>
          <p>Use a unique passphrase of at least 14 characters. Changing it revokes every other active session.</p>
          <form id="passwordForm">
            <label>Current password<input type="password" name="currentPassword" autocomplete="current-password" required minlength="14" maxlength="1024"></label>
            <label>New password<input type="password" name="newPassword" autocomplete="new-password" required minlength="14" maxlength="1024"></label>
            <label>Confirm new password<input type="password" name="confirmPassword" autocomplete="new-password" required minlength="14" maxlength="1024"></label>
            <button class="primary" type="submit">Update password</button><p class="form-status" id="passwordStatus" role="status"></p>
          </form>
        </div>
      </section>
    </main>
  </div>

  <dialog id="editorDialog">
    <form id="editorForm">
      <div class="dialog-head">
        <div><p class="kicker" id="editorKicker">New entry</p><h2 id="editorTitle">Create content</h2></div>
        <button type="button" class="icon-button" id="closeEditor" aria-label="Close">×</button>
      </div>
      <input type="hidden" name="id">
      <div class="editor-layout">
        <div class="editor-fields">
          <div class="editor-grid">
            <label>Category<select name="type" required><option value="post">Post</option><option value="project">Project</option><option value="blog">Blog</option><option value="opinion">Opinion</option><option value="music">Music</option><option value="page">Page</option></select></label>
            <label>Status<select name="status" required><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
            <label class="full">Title<input name="title" maxlength="160" required placeholder="A clear title"></label>
            <label class="full">Slug<input name="slug" maxlength="120" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="clear-url-slug"><small>Generated from the title; edit it if needed.</small></label>
            <label class="full">Excerpt<textarea name="excerpt" rows="3" maxlength="500" placeholder="Short summary shown in listings"></textarea></label>
            <label class="full">Body<textarea name="body" rows="12" maxlength="100000" placeholder="Write your full content here…"></textarea></label>
            <label>Sort order<input name="sortOrder" type="number" value="0" min="-9999" max="9999"></label>
            <label>Publish date<input name="publishedAt" type="datetime-local"></label>
            <label class="full">Metadata (JSON)<textarea name="metadata" rows="5" spellcheck="false">{}</textarea><small>Optional fields: tags, URL, artist, GitHub link, image, video ID, or duration.</small></label>
          </div>
        </div>
        <aside class="editor-preview" aria-label="Content preview">
          <p class="preview-label">Live preview</p><span class="preview-type" id="previewType">Post</span>
          <h3 id="previewTitle">Your title appears here</h3><p id="previewExcerpt">Your short summary will appear here while you write.</p>
          <div class="preview-path">ritikyadav.us/<span id="previewPath">post/new-entry</span></div>
        </aside>
      </div>
      <div class="dialog-actions">
        <p class="form-status" id="editorStatus" role="status"></p>
        <button type="button" class="danger-link" id="deleteBtn" hidden>Delete</button>
        <button type="button" class="secondary" id="cancelEditor">Cancel</button>
        <button type="button" class="secondary" id="saveDraftBtn">Save draft</button>
        <button type="submit" class="primary" id="saveBtn">Save changes</button>
        <button type="button" class="primary publish-button" id="savePublishBtn">Save & publish</button>
      </div>
    </form>
  </dialog>
  <div class="toast" id="toast" role="status"></div>
  <script src="/admin/app.js"></script>
</body>
</html>`;

export const ADMIN_CSS = `
:root{--ink:#141421;--soft:#6b6b7d;--muted:#9292a3;--line:#e7e7ed;--paper:#fff;--wash:#f5f5f8;--dark:#171720;--accent:#665cf6;--accent-soft:#eeecff;--green:#0c9b6a;--green-soft:#e8f8f1;--amber:#c57a07;--amber-soft:#fff5dc;--danger:#c43b32;--danger-soft:#fff0ef;--shadow:0 16px 50px rgba(20,20,33,.07)}*{box-sizing:border-box}html{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--wash)}body{margin:0}button,input,textarea,select{font:inherit}[hidden]{display:none!important}button,a{ -webkit-tap-highlight-color:transparent}.brand{display:inline-flex;align-items:center;gap:8px;font-weight:850;letter-spacing:-.045em;color:var(--ink);text-decoration:none;font-size:1.15rem}.brand>span:first-child{width:10px;height:10px;background:currentColor;border-radius:50%;box-shadow:0 0 0 4px rgba(117,122,146,.17)}.brand>span:last-child{color:#85859a}.kicker,.panel-eyebrow{text-transform:uppercase;letter-spacing:.16em;font-weight:750;font-size:.68rem;color:#7b7b91;margin:0 0 8px}.muted{color:var(--soft)}input,textarea,select{width:100%;border:1px solid #dedee7;background:#fff;border-radius:11px;padding:11px 12px;color:var(--ink);outline:none;transition:border .18s,box-shadow .18s}input:focus,textarea:focus,select:focus{border-color:#9993f8;box-shadow:0 0 0 4px rgba(102,92,246,.1)}textarea{resize:vertical;line-height:1.55}button{cursor:pointer}.primary,.secondary{border-radius:10px;padding:11px 15px;font-weight:720;display:inline-flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;white-space:nowrap}.primary{border:1px solid var(--dark);background:var(--dark);color:#fff}.primary:hover{background:#2a2a37}.secondary{border:1px solid #ddddE6;background:#fff;color:var(--ink)}.secondary:hover{background:#f8f8fb}.compact{padding:8px 12px;font-size:.78rem}.form-status{font-size:.8rem;min-height:1.2em;margin:0;color:var(--danger)}
.login-page{min-height:100vh;background:radial-gradient(circle at 15% 10%,#e9e9f5 0,transparent 34%),radial-gradient(circle at 90% 90%,#eceff5 0,transparent 35%),#fafafa}.login-shell{min-height:100vh;display:grid;place-items:center;padding:24px}.login-card{width:min(100%,440px);background:rgba(255,255,255,.9);backdrop-filter:blur(22px);border:1px solid rgba(15,18,38,.09);border-radius:28px;padding:36px;box-shadow:0 24px 70px rgba(15,18,38,.11)}.login-card .brand{margin-bottom:64px}.login-card h1{font-size:2.35rem;letter-spacing:-.055em;margin:0 0 8px}.login-card>.muted{margin:0 0 30px}.login-card form{display:grid;gap:18px}.login-card label{display:grid;gap:7px;font-size:.82rem;font-weight:650;color:#41465f}.login-card button[type=submit]{width:100%;border:0;background:var(--dark);color:#fff;border-radius:12px;padding:13px 17px;font-weight:700}.security-note{font-size:.72rem;line-height:1.5;color:#85899c;margin:25px 0 0;text-align:center}
.admin-shell{min-height:100vh;display:grid;grid-template-columns:258px minmax(0,1fr)}.sidebar{position:sticky;top:0;height:100vh;padding:26px 18px 18px;background:var(--dark);color:#fff;display:flex;flex-direction:column;overflow:hidden}.sidebar .brand{color:#fff;padding:0 10px}.sidebar .brand>span:last-child{color:#9c9cad}.sidebar-scroll{overflow:auto;scrollbar-width:none}.sidebar-scroll::-webkit-scrollbar{display:none}.nav-label{margin:48px 11px 10px;color:#777786;font-size:.62rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.system-label{margin-top:28px}.category-nav,.system-nav{display:grid;gap:4px}.nav-item{width:100%;border:0;background:transparent;border-radius:11px;padding:10px 11px;text-align:left;color:#a9a9b7;display:grid;grid-template-columns:24px 1fr auto;gap:8px;align-items:center;font-size:.84rem;transition:.17s}.nav-icon{width:20px;height:20px;display:grid;place-items:center;color:#777786}.nav-icon svg{width:18px;height:18px;display:block}.nav-item b{background:#2b2b36;color:#a9a9b7;border-radius:99px;padding:2px 7px;font-size:.66rem;min-width:24px;text-align:center}.nav-item:hover{background:#22222c;color:#fff}.nav-item:hover .nav-icon{color:#b9b9c8}.nav-item.active{background:#302e51;color:#fff;font-weight:730}.nav-item.active .nav-icon{color:#aaa4ff}.nav-item.active b{background:#49447a;color:#fff}.sidebar-foot{margin-top:auto;border-top:1px solid #2b2b35;padding:17px 7px 0;display:grid;grid-template-columns:34px 1fr 34px;gap:9px;align-items:center}.avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#7770ff,#5750d8);display:grid;place-items:center;font-weight:800}.owner{display:grid;min-width:0}.owner strong{font-size:.78rem;overflow:hidden;text-overflow:ellipsis}.owner small{font-size:.65rem;color:#7f7f8e}.signout{width:34px;height:34px;border:0;border-radius:9px;background:#24242e;color:#aaaab7;font-size:1rem}.signout:hover{color:#fff;background:#32323e}
.workspace{padding:40px clamp(24px,4vw,64px) 80px;min-width:0;max-width:1540px;width:100%;margin:0 auto}.workspace-head{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:30px}.workspace-head h1{font-size:clamp(2rem,3vw,3.15rem);letter-spacing:-.06em;margin:0}.view-description{margin:8px 0 0;color:var(--soft);font-size:.9rem}.header-actions{display:flex;align-items:center;gap:9px}.visit-link span{color:var(--muted)}#newBtn b{font-size:1.05rem}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.stat-card{position:relative;background:#fff;border:1px solid var(--line);border-radius:15px;padding:17px 18px;display:grid;grid-template-columns:1fr auto;align-items:end;box-shadow:0 7px 24px rgba(20,20,33,.025);overflow:hidden}.stat-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#c7c7d1}.stat-card.published:before{background:var(--green)}.stat-card.draft:before{background:#e5a129}.stat-card.archived:before{background:#8c8c9d}.stat-card span{grid-column:1/-1;color:var(--soft);font-size:.72rem;font-weight:700}.stat-card strong{font-size:1.75rem;letter-spacing:-.055em;margin-top:6px}.stat-card small{color:var(--muted);font-size:.67rem;margin-bottom:4px}.toolbar{display:grid;grid-template-columns:minmax(240px,1fr) 170px auto;gap:9px;margin-bottom:11px}.search{position:relative}.search span{position:absolute;left:14px;top:8px;font-size:1.3rem;color:#8f8fa1}.search input{padding-left:41px}.publish-all{color:var(--green)}.bulk-bar{min-height:48px;border-radius:12px;background:#eeedff;border:1px solid #dcd9ff;padding:8px 10px 8px 14px;margin-bottom:11px;display:flex;align-items:center;gap:10px;font-size:.78rem}.bulk-bar>button:not(.primary):not(.secondary){border:0;background:transparent;color:#68627f}.bulk-spacer{flex:1}.content-table,.panel{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--shadow)}.table-head,.content-row{display:grid;grid-template-columns:34px minmax(220px,1fr) 88px 104px 105px minmax(245px,auto);gap:12px;align-items:center}.table-head{min-height:45px;padding:0 15px;border-bottom:1px solid var(--line);background:#fbfbfc;color:#8a8a9a;font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.content-row{padding:13px 15px;border-bottom:1px solid var(--line);transition:background .15s}.content-row:last-child{border-bottom:0}.content-row:hover,.content-row.selected{background:#fafaff}.check-wrap{display:grid;place-items:center;width:23px;height:23px;cursor:pointer}.check-wrap input{position:absolute;opacity:0;pointer-events:none}.check-wrap span{width:16px;height:16px;border:1px solid #c9c9d4;border-radius:5px;background:#fff;display:block;position:relative}.check-wrap input:checked+span{background:var(--accent);border-color:var(--accent)}.check-wrap input:checked+span:after{content:"";position:absolute;left:4px;top:1px;width:5px;height:9px;border:solid white;border-width:0 2px 2px 0;transform:rotate(45deg)}.row-title{border:0;background:transparent;padding:0;text-align:left;min-width:0;color:inherit}.row-title strong{display:block;font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row-title small{display:block;color:#9696a5;font-size:.68rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.type-pill,.status-pill{font-size:.66rem;text-transform:capitalize;font-weight:780;letter-spacing:.025em}.type-pill{color:#666678}.status-pill{display:inline-flex;align-items:center;gap:6px}.status-pill:before{content:"";width:7px;height:7px;border-radius:50%;background:#aaaab6}.status-pill.published:before{background:var(--green)}.status-pill.draft:before{background:#e5a129}.date-cell{font-size:.68rem;color:#7e7e90}.row-actions{display:flex;justify-content:flex-end;gap:5px}.row-action{border:1px solid #e0e0e7;background:#fff;color:#555568;border-radius:8px;padding:6px 8px;font-size:.66rem;font-weight:700}.row-action:hover{background:#f5f5fa}.row-action.publish{color:var(--green);border-color:#cfe9df}.row-action.delete{color:var(--danger);border-color:#f0d1ce}.empty{padding:70px 20px;text-align:center;color:#7e7e90}.empty strong{display:block;color:var(--ink);font-size:1rem;margin-bottom:5px}.panel{padding:25px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:20px}.panel h2{margin:0 0 5px;letter-spacing:-.035em}.panel p{margin:0;color:var(--soft)}.audit-list{margin-top:22px}.audit-row{display:grid;grid-template-columns:165px 1fr 180px;gap:18px;padding:14px 3px;border-top:1px solid var(--line);font-size:.78rem}.audit-row time,.audit-row small{color:#7c7c90}.account-panel{max-width:670px}.account-panel>p:not(.panel-eyebrow){margin-bottom:26px}.account-panel form{display:grid;gap:17px}.account-panel label,.editor-grid label{display:grid;gap:7px;font-size:.78rem;font-weight:680;color:#464659}.account-panel .primary{justify-self:start}
.overview-dashboard{margin-bottom:18px}.overview-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(340px,.65fr);gap:14px}.analytics-panel,.notification-panel{min-width:0}.analytics-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:24px 0}.analytics-metrics>div{background:#f8f8fb;border:1px solid #ededf2;border-radius:12px;padding:14px}.analytics-metrics span,.analytics-metrics small{display:block;color:var(--soft);font-size:.65rem}.analytics-metrics strong{display:block;font-size:1.55rem;letter-spacing:-.055em;margin:5px 0 3px}.analytics-metrics small.positive{color:var(--green)}.analytics-metrics small.negative{color:var(--danger)}.traffic-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(180px,.7fr);gap:22px}.subhead{font-size:.65rem!important;text-transform:uppercase;letter-spacing:.09em;font-weight:800;color:#8e8e9e!important;margin:0 0 12px!important}.traffic-chart{height:142px;display:flex;align-items:end;gap:5px;border-bottom:1px solid #e7e7ed;padding:0 3px}.chart-day{height:100%;flex:1;display:flex;align-items:end;justify-content:center;position:relative}.chart-day i{display:block;width:100%;max-width:18px;min-height:4px;background:linear-gradient(180deg,#8279ff,#5e54df);border-radius:5px 5px 2px 2px;transition:height .25s}.chart-day span{position:absolute;top:calc(100% + 6px);font-size:.52rem;color:#9999a8;white-space:nowrap}.top-pages{display:grid;gap:7px}.top-page{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border-bottom:1px solid #f0f0f3;padding-bottom:7px;font-size:.7rem}.top-page span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#5f5f71}.top-page strong{font-size:.68rem}.top-pages .mini-empty{color:#9696a4;font-size:.7rem;line-height:1.5}.notification-count{display:inline-grid;place-items:center;vertical-align:middle;background:var(--danger);color:#fff;border-radius:99px;min-width:21px;height:21px;padding:0 6px;font-size:.62rem;margin-left:5px}.security-posture{display:grid;grid-template-columns:38px 1fr;gap:11px;align-items:center;border-radius:12px;background:var(--green-soft);border:1px solid #cfeadd;padding:12px;margin:21px 0 10px}.security-posture.attention{background:var(--amber-soft);border-color:#f1ddb0}.security-posture.urgent{background:var(--danger-soft);border-color:#f1ceca}.posture-icon{width:34px;height:34px;border-radius:10px;background:#fff;display:grid;place-items:center;color:var(--green);font-weight:900}.security-posture.attention .posture-icon{color:var(--amber)}.security-posture.urgent .posture-icon{color:var(--danger)}.security-posture strong,.security-posture small{display:block}.security-posture strong{font-size:.76rem}.security-posture small{font-size:.65rem;color:#727283;margin-top:2px}.notification-list{display:grid}.notification-item{display:grid;grid-template-columns:9px minmax(0,1fr) auto;gap:10px;align-items:start;padding:11px 2px;border-bottom:1px solid #eeeef2}.notification-item.reviewed{opacity:.55}.severity-dot{width:8px;height:8px;border-radius:50%;margin-top:4px;background:#9a9aa8}.severity-dot.medium{background:var(--amber)}.severity-dot.high,.severity-dot.critical{background:var(--danger)}.notification-item strong{display:block;font-size:.72rem}.notification-item small{display:block;color:#858596;font-size:.62rem;margin-top:3px;line-height:1.35}.notification-item time{font-size:.58rem;color:#a0a0ad;white-space:nowrap}.notification-link{width:100%;border:0;background:transparent;color:#56506e;padding:14px 0 0;text-align:left;font-size:.7rem;font-weight:750}.notification-link span{float:right}.notification-list .mini-empty{padding:25px 5px;text-align:center;color:#858596;font-size:.72rem}#contentManager{border-top:1px solid #e2e2e8;padding-top:18px}
dialog{width:min(1120px,calc(100vw - 28px));max-height:calc(100vh - 28px);border:1px solid var(--line);border-radius:20px;padding:0;box-shadow:0 30px 100px rgba(15,18,38,.24);overflow:hidden}dialog::backdrop{background:rgba(13,13,21,.52);backdrop-filter:blur(5px)}#editorForm{display:flex;flex-direction:column;max-height:calc(100vh - 30px)}.dialog-head{display:flex;align-items:start;justify-content:space-between;padding:24px 26px 18px;border-bottom:1px solid var(--line)}.dialog-head h2{font-size:1.75rem;letter-spacing:-.045em;margin:0}.icon-button{border:0;background:#f0f0f4;border-radius:50%;width:36px;height:36px;font-size:1.4rem}.editor-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;min-height:0;overflow:auto}.editor-fields{padding:22px 26px}.editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.editor-grid .full{grid-column:1/-1}.editor-grid label small{color:#9292a2;font-weight:450}.editor-preview{border-left:1px solid var(--line);background:#f8f8fb;padding:28px 24px;position:sticky;top:0;align-self:start;min-height:100%}.preview-label{margin:0 0 28px;text-transform:uppercase;letter-spacing:.13em;font-size:.62rem;font-weight:800;color:#9393a2}.preview-type{display:inline-flex;background:var(--accent-soft);color:#5c54d9;border-radius:99px;padding:5px 9px;font-size:.65rem;font-weight:800;text-transform:capitalize}.editor-preview h3{font-size:1.65rem;line-height:1.08;letter-spacing:-.045em;margin:18px 0 10px;overflow-wrap:anywhere}.editor-preview>p:not(.preview-label){font-size:.8rem;color:var(--soft);line-height:1.55;overflow-wrap:anywhere}.preview-path{border-top:1px solid var(--line);margin-top:24px;padding-top:15px;color:#9999a8;font-size:.65rem;overflow-wrap:anywhere}.dialog-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:15px 26px;border-top:1px solid var(--line);background:#fff}.dialog-actions .form-status{margin-right:auto}.danger-link{border:0;background:none;color:var(--danger);font-weight:700;padding:9px}.publish-button{background:var(--accent);border-color:var(--accent)}.publish-button:hover{background:#574ed8}.toast{position:fixed;right:24px;bottom:24px;z-index:20;background:#171720;color:#fff;border-radius:11px;padding:11px 15px;box-shadow:0 12px 35px rgba(15,18,38,.25);transform:translateY(20px);opacity:0;pointer-events:none;transition:.2s;font-size:.8rem}.toast.show{opacity:1;transform:none}
@media(max-width:1180px){.overview-grid{grid-template-columns:1fr}.table-head,.content-row{grid-template-columns:34px minmax(190px,1fr) 78px 95px minmax(220px,auto)}.table-head>span:nth-of-type(4),.date-cell{display:none}.editor-layout{grid-template-columns:minmax(0,1fr) 270px}}
@media(max-width:920px){.admin-shell{grid-template-columns:1fr}.sidebar{position:relative;height:auto;padding:16px;overflow:visible}.sidebar .brand{padding:0 4px}.sidebar-scroll{overflow:visible}.nav-label{display:none}.category-nav,.system-nav{display:flex;gap:6px;overflow-x:auto;padding:14px 0 1px;scrollbar-width:none}.system-nav{padding-top:7px}.category-nav::-webkit-scrollbar,.system-nav::-webkit-scrollbar{display:none}.nav-item{width:auto;flex:0 0 auto;grid-template-columns:20px auto auto;padding:9px 11px}.sidebar-foot{position:absolute;right:16px;top:10px;border:0;padding:0}.owner{display:none}.workspace{padding:28px 16px 70px}.workspace-head{align-items:flex-start}.stats-grid{grid-template-columns:1fr 1fr}.editor-layout{grid-template-columns:1fr}.editor-preview{display:none}}
@media(max-width:680px){.workspace-head{display:grid}.header-actions{width:100%}.header-actions>*{flex:1}.analytics-metrics{grid-template-columns:1fr 1fr}.traffic-layout{grid-template-columns:1fr}.traffic-chart{margin-bottom:22px}.panel-head{align-items:flex-start}.notification-panel .panel-head{display:grid}.toolbar{grid-template-columns:1fr 1fr}.search{grid-column:1/-1}.publish-all{grid-column:1/-1}.table-head{display:none}.content-row{grid-template-columns:28px minmax(0,1fr);gap:8px 10px;padding:15px}.content-row>.type-pill,.content-row>.status-pill,.content-row>.date-cell{grid-column:2}.content-row>.type-pill{display:none}.row-actions{grid-column:2;justify-content:flex-start;flex-wrap:wrap;margin-top:4px}.bulk-bar{flex-wrap:wrap}.bulk-spacer{display:none}.dialog-head{padding:20px}.editor-fields{padding:20px}.editor-grid{grid-template-columns:1fr}.editor-grid .full{grid-column:auto}.dialog-actions{padding:12px 16px;flex-wrap:wrap}.dialog-actions .form-status{width:100%;margin:0}.dialog-actions button{flex:1}.dialog-actions .danger-link{flex:0 0 auto}}
@media(max-width:460px){.workspace-head h1{font-size:2rem}.visit-link{display:none}.stats-grid{grid-template-columns:1fr 1fr;gap:8px}.stat-card{padding:14px}.stat-card strong{font-size:1.45rem}.header-actions #newBtn{width:100%}.toolbar{grid-template-columns:1fr}.search,.publish-all{grid-column:auto}.sidebar-foot{right:12px}.category-nav{padding-right:46px}.row-action{padding:7px 9px}.toast{left:14px;right:14px;bottom:14px;text-align:center}}
`;

export const ADMIN_JS = `
const TYPES={post:{label:'Posts',single:'post'},project:{label:'Projects',single:'project'},blog:{label:'Blog',single:'blog entry'},opinion:{label:'Opinions',single:'opinion'},music:{label:'Music',single:'track'},page:{label:'Pages',single:'page'}};
const SECURITY_LABELS={cross_origin_gateway:'Cross-origin gateway request blocked',gateway_rate_limited:'Private gateway rate limit triggered',malformed_private_entry:'Malformed private-entry link blocked',invalid_private_entry:'Invalid or expired private-entry token',login_rate_limited:'Admin login locked by rate limit',invalid_credentials:'Incorrect admin credentials rejected',turnstile_rejected:'Automated login attempt rejected',blocked_admin_mutation:'Unauthorized admin change blocked'};
const state={items:[],current:null,csrf:'',view:'content',type:'',selected:new Set(),slugTouched:false};
const $=(selector,root=document)=>root.querySelector(selector);const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
async function api(path,options={}){const headers=new Headers(options.headers||{});headers.set('Accept','application/json');if(options.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');if(!['GET','HEAD'].includes(options.method||'GET'))headers.set('X-CSRF-Token',state.csrf);const response=await fetch(path,{...options,headers});if(response.status===401){location.replace('/');throw new Error('Session expired.');}const type=(response.headers.get('content-type')||'').toLowerCase();if(!type.includes('application/json'))throw new Error('The secure service returned an unexpected response. Please try again.');const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Request failed.');return payload;}
function text(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function date(value){if(!value)return 'Not scheduled';return new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(value*1000));}
function relativeTime(value){const seconds=Math.max(0,Math.floor(Date.now()/1000)-value);if(seconds<60)return 'just now';if(seconds<3600)return Math.floor(seconds/60)+'m ago';if(seconds<86400)return Math.floor(seconds/3600)+'h ago';return Math.floor(seconds/86400)+'d ago';}
function toast(message){const element=$('#toast');element.textContent=message;element.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>element.classList.remove('show'),2400);}
function renderOverview(data){const analytics=data.analytics;$('#todayViews').textContent=analytics.todayViews.toLocaleString();$('#todayVisitors').textContent=analytics.todayVisitors.toLocaleString();$('#sevenDayViews').textContent=analytics.sevenDayViews.toLocaleString();$('#thirtyDayViews').textContent=analytics.thirtyDayViews.toLocaleString();const change=$('#viewsChange');change.className='';if(analytics.change===null){change.textContent=analytics.todayViews?'New baseline':'Collecting data';}else{change.textContent=(analytics.change>0?'+':'')+analytics.change+'% vs yesterday';change.className=analytics.change>=0?'positive':'negative';}const max=Math.max(1,...analytics.daily.map(row=>row.views));$('#trafficChart').innerHTML=analytics.daily.map((row,index)=>'<div class="chart-day" title="'+text(row.day)+': '+row.views+' views"><i style="height:'+Math.max(4,Math.round(row.views/max*100))+'%"></i><span>'+(index%3===0?text(row.day.slice(5)):'')+'</span></div>').join('');$('#topPages').innerHTML=analytics.topPages.length?analytics.topPages.map(row=>'<div class="top-page"><span title="'+text(row.path)+'">'+text(row.path)+'</span><strong>'+Number(row.views).toLocaleString()+'</strong></div>').join(''):'<p class="mini-empty">Traffic will appear after visitors load the updated site.</p>';const security=data.security;const count=$('#notificationCount');count.textContent=security.unread;count.hidden=!security.unread;$('#reviewNotifications').disabled=!security.unread;const posture=$('#securityPosture');posture.className='security-posture'+(security.urgent?' urgent':security.unread?' attention':'');$('.posture-icon',posture).textContent=security.urgent?'!':security.unread?'•':'✓';$('#postureTitle').textContent=security.urgent?'Security review needed':security.unread?'New activity to review':'Protection active';$('#postureText').textContent=security.attempts24h?security.attempts24h+' blocked attempt'+(security.attempts24h===1?'':'s')+' in the last 24 hours.':'No blocked attempts in the last 24 hours.';$('#notificationList').innerHTML=security.items.length?security.items.map(item=>'<article class="notification-item '+(item.acknowledged_at?'reviewed':'')+'"><span class="severity-dot '+text(item.severity)+'"></span><div><strong>'+text(SECURITY_LABELS[item.kind]||item.kind.replaceAll('_',' '))+(item.occurrence_count>1?' ×'+item.occurrence_count:'')+'</strong><small>'+text(item.method)+' '+text(item.path)+' · '+text(item.severity)+' severity</small></div><time>'+relativeTime(item.last_seen_at)+'</time></article>').join(''):'<p class="mini-empty">No suspicious activity has been recorded. Protection is active.</p>';}
async function loadOverview(){try{renderOverview(await api('/api/admin/overview'));}catch(error){toast(error.message);}}
function activeItems(){return state.type?state.items.filter(item=>item.type===state.type):state.items;}
function visibleItems(){const query=$('#searchInput').value.trim().toLowerCase();const status=$('#statusFilter').value;return activeItems().filter(item=>(!query||item.title.toLowerCase().includes(query)||item.slug.toLowerCase().includes(query))&&(!status||item.status===status));}
function updateCounts(){$$('[data-count]').forEach(badge=>{const type=badge.dataset.count;badge.textContent=type==='all'?state.items.length:state.items.filter(item=>item.type===type).length;});const items=activeItems();$('#statAll').textContent=items.length;$('#statPublished').textContent=items.filter(item=>item.status==='published').length;$('#statDraft').textContent=items.filter(item=>item.status==='draft').length;$('#statArchived').textContent=items.filter(item=>item.status==='archived').length;}
function updateBulk(items){const visibleIds=new Set(items.map(item=>item.id));const selectedVisible=items.filter(item=>state.selected.has(item.id));$('#selectedCount').textContent=state.selected.size;$('#bulkBar').hidden=state.selected.size===0;const allVisible=items.length>0&&items.every(item=>state.selected.has(item.id));$('#selectAll').checked=allVisible;$('#selectAll').indeterminate=!allVisible&&selectedVisible.length>0;$$('.content-row').forEach(row=>row.classList.toggle('selected',state.selected.has(Number(row.dataset.id))));}
function render(){updateCounts();const items=visibleItems();$('#contentList').innerHTML=items.length?items.map(item=>'<article class="content-row" data-id="'+item.id+'"><label class="check-wrap"><input class="row-select" type="checkbox" aria-label="Select '+text(item.title)+'" '+(state.selected.has(item.id)?'checked':'')+'><span></span></label><button class="row-title" data-action="edit"><strong>'+text(item.title)+'</strong><small>/'+text(item.type)+'/'+text(item.slug)+'</small></button><span class="type-pill">'+text(item.type)+'</span><span class="status-pill '+text(item.status)+'">'+text(item.status)+'</span><span class="date-cell">'+date(item.published_at||item.updated_at)+'</span><div class="row-actions"><button class="row-action" data-action="edit">Edit</button><button class="row-action publish" data-action="toggle">'+(item.status==='published'?'Unpublish':'Publish')+'</button><button class="row-action" data-action="archive">Archive</button><button class="row-action delete" data-action="delete">Delete</button></div></article>').join(''):'<div class="empty"><strong>No content here yet.</strong>Use the Add button to create the first entry in this category.</div>';updateBulk(items);}
async function loadContent(){const data=await api('/api/admin/content');state.items=data.items;for(const id of [...state.selected])if(!state.items.some(item=>item.id===id))state.selected.delete(id);render();}
function itemPayload(item,status=item.status){return{type:item.type,status,title:item.title,slug:item.slug,excerpt:item.excerpt||'',body:item.body||'',metadata:item.metadata||{},sortOrder:item.sort_order||0,publishedAt:status==='published'?(item.published_at||Math.floor(Date.now()/1000)):item.published_at};}
async function setStatus(items,status){if(!items.length){toast('Nothing to update.');return;}for(const item of items)await api('/api/admin/content/'+item.id,{method:'PUT',body:JSON.stringify(itemPayload(item,status))});state.selected.clear();await loadContent();toast(items.length+' '+(items.length===1?'entry':'entries')+' set to '+status+'.');}
function localDateTime(epoch){if(!epoch)return '';const value=new Date(epoch*1000-new Date(epoch*1000).getTimezoneOffset()*60000);return value.toISOString().slice(0,16);}
function slugify(value){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120);}
function updatePreview(){const form=$('#editorForm');const title=form.title.value.trim()||'Your title appears here';const excerpt=form.excerpt.value.trim()||'Your short summary will appear here while you write.';const type=form.type.value||'post';const slug=form.slug.value.trim()||'new-entry';$('#previewTitle').textContent=title;$('#previewExcerpt').textContent=excerpt;$('#previewType').textContent=TYPES[type]?.single||type;$('#previewPath').textContent=type+'/'+slug;}
function openEditor(item=null){state.current=item;state.slugTouched=Boolean(item);const form=$('#editorForm');form.reset();form.metadata.value='{}';form.sortOrder.value='0';form.status.value='draft';form.type.value=state.type||'post';if(item){form.id.value=item.id;form.type.value=item.type;form.status.value=item.status;form.title.value=item.title;form.slug.value=item.slug;form.excerpt.value=item.excerpt||'';form.body.value=item.body||'';form.metadata.value=JSON.stringify(item.metadata||{},null,2);form.sortOrder.value=item.sort_order||0;form.publishedAt.value=localDateTime(item.published_at);$('#editorKicker').textContent='Edit '+(TYPES[item.type]?.single||'entry');$('#editorTitle').textContent=item.title;$('#deleteBtn').hidden=false;}else{form.id.value='';$('#editorKicker').textContent='New '+(TYPES[form.type.value]?.single||'entry');$('#editorTitle').textContent='Create content';$('#deleteBtn').hidden=true;}$('#editorStatus').textContent='';updatePreview();$('#editorDialog').showModal();setTimeout(()=>form.title.focus(),30);}
function edit(id){const item=state.items.find(entry=>entry.id===id);if(item)openEditor(item);}
async function saveEditor(statusOverride){const form=$('#editorForm');if(!form.reportValidity())return;const data=new FormData(form);let metadata;try{metadata=JSON.parse(String(data.get('metadata')||'{}'));}catch{$('#editorStatus').textContent='Metadata must be valid JSON.';return;}const status=statusOverride||String(data.get('status')||'draft');const publishedValue=data.get('publishedAt');const body={type:data.get('type'),status,title:String(data.get('title')||'').trim(),slug:String(data.get('slug')||'').trim(),excerpt:String(data.get('excerpt')||''),body:String(data.get('body')||''),metadata,sortOrder:Number(data.get('sortOrder')||0),publishedAt:publishedValue?Math.floor(new Date(String(publishedValue)).getTime()/1000):(status==='published'?Math.floor(Date.now()/1000):null)};$('#editorStatus').textContent=status==='published'?'Publishing…':'Saving…';$$('.dialog-actions button').forEach(button=>button.disabled=true);try{const id=String(data.get('id')||'');await api(id?'/api/admin/content/'+id:'/api/admin/content',{method:id?'PUT':'POST',body:JSON.stringify(body)});$('#editorDialog').close();await loadContent();toast(status==='published'?'Published successfully.':id?'Entry updated.':'Draft created.');}catch(error){$('#editorStatus').textContent=error.message.includes('UNIQUE')?'That category and slug already exist.':error.message;}finally{$$('.dialog-actions button').forEach(button=>button.disabled=false);}}
async function deleteItem(item,fromEditor=false){if(!item||!confirm('Delete “'+item.title+'”? This action is recorded in the security log.'))return;try{await api('/api/admin/content/'+item.id,{method:'DELETE'});if(fromEditor)$('#editorDialog').close();state.selected.delete(item.id);await loadContent();toast('Entry deleted.');}catch(error){if(fromEditor)$('#editorStatus').textContent=error.message;else toast(error.message);}}
function closeEditor(){if($('#editorForm').matches(':invalid')&&!confirm('Discard this unfinished entry?'))return;$('#editorDialog').close();}
function switchSection(button){state.view=button.dataset.view;state.type=state.view==='content'?(button.dataset.type||''):state.type;state.selected.clear();$$('.nav-item').forEach(item=>item.classList.toggle('active',item===button));$('#contentView').hidden=state.view!=='content';$('#auditView').hidden=state.view!=='audit';$('#accountView').hidden=state.view!=='account';$('#newBtn').hidden=state.view!=='content';const config=state.type?TYPES[state.type]:null;if(state.view==='content'){$('#overviewDashboard').hidden=Boolean(config);$('#viewKicker').textContent=config?'Website category':'Traffic, content & protection';$('#viewTitle').textContent=config?config.label:'Website overview';$('#viewDescription').textContent=config?'Create, edit, organize, and publish '+config.label.toLowerCase()+'.':'Monitor the website, security alerts, and everything visitors can see.';$('#newTypeLabel').textContent=config?config.single:'content';render();if(!config)loadOverview();}else if(state.view==='audit'){$('#viewKicker').textContent='Protection & accountability';$('#viewTitle').textContent='Security log';$('#viewDescription').textContent='Review access attempts and every recorded change.';loadAudit();}else{$('#viewKicker').textContent='Owner settings';$('#viewTitle').textContent='Account security';$('#viewDescription').textContent='Manage the credentials protecting this workspace.';}}
async function loadAudit(){const data=await api('/api/admin/audit');$('#auditList').innerHTML=data.items.length?data.items.map(item=>'<div class="audit-row"><time>'+new Date(item.created_at*1000).toLocaleString()+'</time><div><strong>'+text(item.action.replaceAll('_',' '))+'</strong><br><small>'+text(item.entity_type)+(item.entity_id?' · '+text(item.entity_id):'')+'</small></div><small>'+text(item.detail||'')+'</small></div>').join(''):'<div class="empty"><strong>No security events yet.</strong>Activity will appear here.</div>';}
$$('.nav-item').forEach(button=>button.addEventListener('click',()=>switchSection(button)));
$('#newBtn').addEventListener('click',()=>openEditor());$('#closeEditor').addEventListener('click',closeEditor);$('#cancelEditor').addEventListener('click',closeEditor);
$('#editorForm').addEventListener('submit',event=>{event.preventDefault();saveEditor();});$('#saveDraftBtn').addEventListener('click',()=>saveEditor('draft'));$('#savePublishBtn').addEventListener('click',()=>saveEditor('published'));$('#deleteBtn').addEventListener('click',()=>deleteItem(state.current,true));
$('#editorForm').addEventListener('input',event=>{if(event.target.name==='title'&&!state.slugTouched)$('#editorForm').slug.value=slugify(event.target.value);if(event.target.name==='slug')state.slugTouched=true;updatePreview();});
$('#searchInput').addEventListener('input',render);$('#statusFilter').addEventListener('change',render);
$('#contentList').addEventListener('change',event=>{const checkbox=event.target.closest('.row-select');if(!checkbox)return;const id=Number(event.target.closest('.content-row').dataset.id);if(checkbox.checked)state.selected.add(id);else state.selected.delete(id);updateBulk(visibleItems());});
$('#contentList').addEventListener('click',async event=>{const actionButton=event.target.closest('[data-action]');if(!actionButton)return;const row=event.target.closest('.content-row');const item=state.items.find(entry=>entry.id===Number(row.dataset.id));if(!item)return;const action=actionButton.dataset.action;if(action==='edit')edit(item.id);else if(action==='toggle')await setStatus([item],item.status==='published'?'draft':'published');else if(action==='archive')await setStatus([item],'archived');else if(action==='delete')await deleteItem(item);});
$('#selectAll').addEventListener('change',event=>{for(const item of visibleItems()){if(event.target.checked)state.selected.add(item.id);else state.selected.delete(item.id);}updateBulk(visibleItems());render();});
$('#clearSelection').addEventListener('click',()=>{state.selected.clear();render();});$('#publishSelected').addEventListener('click',()=>setStatus(state.items.filter(item=>state.selected.has(item.id)),'published'));$('#archiveSelected').addEventListener('click',()=>setStatus(state.items.filter(item=>state.selected.has(item.id)),'archived'));
$('#publishAllBtn').addEventListener('click',async()=>{const drafts=activeItems().filter(item=>item.status==='draft');if(!drafts.length){toast('There are no drafts in this category.');return;}if(confirm('Publish all '+drafts.length+' draft'+(drafts.length===1?'':'s')+' in this category?'))await setStatus(drafts,'published');});
$('#refreshAudit').addEventListener('click',loadAudit);
$('#refreshOverview').addEventListener('click',loadOverview);$('#reviewNotifications').addEventListener('click',async()=>{try{await api('/api/admin/security/acknowledge',{method:'PUT',body:'{}'});await loadOverview();toast('Security notifications marked as reviewed.');}catch(error){toast(error.message);}});$('#openSecurityLog').addEventListener('click',()=>switchSection($('.nav-item[data-view="audit"]')));
$('#passwordForm').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const currentPassword=String(data.get('currentPassword')||'');const newPassword=String(data.get('newPassword')||'');if(newPassword!==String(data.get('confirmPassword')||'')){$('#passwordStatus').textContent='New passwords do not match.';return;}$('#passwordStatus').textContent='Updating…';try{await api('/api/admin/password',{method:'PUT',body:JSON.stringify({currentPassword,newPassword})});form.reset();$('#passwordStatus').textContent='Password updated. Other sessions were revoked.';}catch(error){$('#passwordStatus').textContent=error.message;}});
$('#logoutBtn').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST'});}finally{location.replace('/');}});
async function boot(){try{const session=await api('/api/admin/session');state.csrf=session.csrf;$('#adminName').textContent=session.username;await loadContent();await loadOverview();}catch(error){console.error(error);}}boot();
`;
