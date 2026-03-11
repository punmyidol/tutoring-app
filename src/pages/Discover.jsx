import { useState, useMemo } from "react";
import { SUBJECT_COLORS, VIDEOS } from "../data/data.js";
import { VideoCard } from "../components/components.jsx";
import ProgressPage from "./Progress.jsx";
import SavedPage from "./Saved.jsx";

export default function DiscoverPage({ onSelectVideo, theme, onToggleTheme, savedIds, votes, onToggleSave, onVote, watchHistory }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState("discover"); // "discover" | "saved" | "progress"

  const tags = ["All", ...Object.keys(SUBJECT_COLORS)];

  const filtered = useMemo(() => {
    return VIDEOS.filter((v) => {
      const matchesTag = activeTag === "All" || v.subject === activeTag;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.creator.toLowerCase().includes(q) ||
        v.subject.toLowerCase().includes(q) ||
        v.desc.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [search, activeTag]);

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", color: "var(--text)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border-muted); border-radius: 3px; }

        [data-theme="dark"] {
          --bg: #0a0a0f;
          --bg-secondary: #12121e;
          --bg-input: #1a1a2e;
          --border: #1e1e2e;
          --border-muted: #2a2a3a;
          --border-input: #2a2a40;
          --border-hover: #2e2e4e;
          --border-focus: #4a4a7a;
          --text: #e8e8f0;
          --text-muted: #666680;
          --text-dim: #555570;
          --text-very-dim: #444460;
          --header-bg: rgba(10,10,15,0.92);
          --card-thumb-bg: #0d0d1a;
          --action-btn-bg: rgba(255,255,255,0.05);
          --action-btn-hover: rgba(255,255,255,0.11);
          --action-btn-border: rgba(255,255,255,0.08);
        }
        [data-theme="light"] {
          --bg: #f0f0f7;
          --bg-secondary: #ffffff;
          --bg-input: #ffffff;
          --border: #e0e0ee;
          --border-muted: #d0d0e4;
          --border-input: #d0d0e4;
          --border-hover: #b0b0cc;
          --border-focus: #8080b0;
          --text: #0a0a1f;
          --text-muted: #5a5a80;
          --text-dim: #7878a0;
          --text-very-dim: #9898b8;
          --header-bg: rgba(240,240,247,0.95);
          --card-thumb-bg: #e0e0f0;
          --action-btn-bg: rgba(0,0,0,0.04);
          --action-btn-hover: rgba(0,0,0,0.08);
          --action-btn-border: rgba(0,0,0,0.08);
        }

        .card {
          background: var(--bg-secondary); border-radius: 14px; overflow: hidden;
          cursor: pointer; position: relative;
          transition: transform 0.22s cubic-bezier(.22,.68,0,1.2), box-shadow 0.22s ease;
          border: 1px solid var(--border);
        }
        .card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          border-color: var(--border-hover);
        }
        .thumb-wrap {
          position: relative; width: 100%; padding-bottom: 177.78%;
          overflow: hidden; background: var(--card-thumb-bg);
        }
        .thumb-wrap img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; transition: transform 0.4s ease;
        }
        .card:hover .thumb-wrap img { transform: scale(1.05); }
        .play-btn {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
        }
        .card:hover .play-btn { opacity: 1; }
        .play-circle {
          width: 52px; height: 52px; background: rgba(255,255,255,0.95);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .play-triangle {
          width: 0; height: 0; border-style: solid;
          border-width: 9px 0 9px 17px;
          border-color: transparent transparent transparent #111;
          margin-left: 3px;
        }
        .duration-badge {
          position: absolute; bottom: 8px; right: 8px;
          background: rgba(0,0,0,0.85); color: #fff;
          font-size: 11px; font-weight: 600; padding: 2px 7px;
          border-radius: 5px; letter-spacing: 0.3px;
        }
        .tag-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 600; padding: 3px 9px;
          border-radius: 99px; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .filter-btn {
          border: none; cursor: pointer; padding: 8px 18px; border-radius: 99px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          transition: all 0.18s ease; letter-spacing: 0.2px; white-space: nowrap;
        }
        .search-input {
          width: 100%; background: var(--bg-input); border: 1.5px solid var(--border-input);
          border-radius: 12px; padding: 12px 18px 12px 46px;
          color: var(--text); font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .search-input::placeholder { color: var(--text-dim); }
        .search-input:focus { border-color: var(--border-focus); }
        .grid-3 {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;
        }
        @media (max-width: 1200px) { .grid-3 { grid-template-columns: repeat(5, 1fr); } }
        @media (max-width: 900px)  { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 580px)  { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
        .logo-dot {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          background: #4a7bff; margin-left: 2px; vertical-align: middle; position: relative; top: -2px;
        }
        .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-very-dim);
        }
        .stat-pill {
          display: inline-flex; align-items: center; gap: 4px; color: var(--text-dim); font-size: 11px;
        }
        .action-btn {
          background: var(--action-btn-bg);
          border: 1px solid var(--action-btn-border);
          cursor: pointer; border-radius: 99px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.15s, transform 0.1s;
          padding: 8px 12px; gap: 5px;
          font-size: 13px; font-weight: 600;
          color: var(--text-dim);
          font-family: inherit;
          min-height: 36px;
        }
        .action-btn:hover { background: var(--action-btn-hover); transform: scale(1.06); }
        .action-btn.active-up   { color: #4a7bff; border-color: rgba(74,123,255,0.3); background: rgba(74,123,255,0.1); }
        .action-btn.active-down { color: #ff6b6b; border-color: rgba(255,107,107,0.3); background: rgba(255,107,107,0.1); }
        .action-btn.active-heart { color: #ff4a7b; border-color: rgba(255,74,123,0.3); background: rgba(255,74,123,0.1); }
        .theme-btn {
          background: var(--action-btn-bg); border: 1px solid var(--border-muted);
          cursor: pointer; border-radius: 99px; padding: 6px 12px;
          font-size: 12px; font-weight: 500; color: var(--text-muted);
          font-family: inherit; transition: background 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .theme-btn:hover { background: var(--action-btn-hover); }
        .nav-link { cursor: pointer; transition: color 0.15s; }
        .nav-link:hover { color: var(--text) !important; }
        @media (max-width: 480px) {
          .header-nav { display: none !important; }
          .theme-btn span { display: none; }
          .hero-h1 { font-size: 28px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)", padding: "0 32px",
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--header-bg)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.5px" }}>
              edu<span style={{ color: "#4a7bff" }}>scroll</span>
            </span>
            <span className="logo-dot" />
          </div>
          <nav className="header-nav" style={{ display: "flex", gap: 28, fontSize: 13 }}>
            <span
              className="nav-link"
              onClick={() => setView("discover")}
              style={{ color: view === "discover" ? "var(--text)" : "var(--text-muted)", fontWeight: view === "discover" ? 500 : 400 }}
            >Discover</span>
            <span
              className="nav-link"
              onClick={() => setView("saved")}
              style={{ color: view === "saved" ? "var(--text)" : "var(--text-muted)", fontWeight: view === "saved" ? 500 : 400, display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              Saved
              {savedIds.size > 0 && (
                <span style={{ background: "#ff4a7b", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, lineHeight: 1.6 }}>
                  {savedIds.size}
                </span>
              )}
            </span>
            <span
              className="nav-link"
              onClick={() => setView("progress")}
              style={{ color: view === "progress" ? "var(--text)" : "var(--text-muted)", fontWeight: view === "progress" ? 500 : 400 }}
            >Progress</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="theme-btn" onClick={onToggleTheme}>
              {theme === "dark"
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06-1.06L5.635 3.515a.75.75 0 00-1.06 1.06l1.59 1.591z"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/></svg>
              }
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
              background: "linear-gradient(135deg, #4a7bff, #9b27af)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: "#fff",
            }}>S</div>
          </div>
        </div>
      </header>

      <main style={{ padding: "0" }}>

        {view === "progress" && <ProgressPage watchHistory={watchHistory} />}

        {view === "saved" && (
          <SavedPage
            savedIds={savedIds}
            votes={votes}
            onToggleSave={onToggleSave}
            onVote={onVote}
            onSelectVideo={onSelectVideo}
          />
        )}

        {view === "discover" && <div style={{ padding: "36px 24px 80px", width: "100%", boxSizing: "border-box" }}>
        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-1px" }}>
            Learn anything,<br /><span style={{ color: "#4a7bff" }}>one scroll</span> at a time.
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            {`${VIDEOS.length} curated lessons across ${Object.keys(SUBJECT_COLORS).length} subjects`}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4, color: "var(--text)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search by topic, creator, or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
            >×</button>
          )}
        </div>

        {/* Tag filters */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 32, scrollbarWidth: "none" }}>
          {tags.map(tag => {
            const isActive = activeTag === tag;
            const col = SUBJECT_COLORS[tag];
            return (
              <button
                key={tag}
                className="filter-btn"
                onClick={() => setActiveTag(tag)}
                style={{
                  background: isActive ? (col ? col.bg : "#4a7bff") : "var(--bg-input)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                  border: isActive ? "1.5px solid transparent" : "1.5px solid var(--border-muted)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {col && <span style={{ marginRight: 4 }}>{col.emoji}</span>}
                {tag}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {(search || activeTag !== "All") && (
          <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text-dim)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {activeTag !== "All" && <span> in <strong style={{ color: SUBJECT_COLORS[activeTag]?.bg }}>{activeTag}</strong></span>}
            {search && <span> for "<strong style={{ color: "var(--text)" }}>{search}</strong>"</span>}
          </div>
        )}

        {/* Grid */}
        <div className="grid-3">
          {filtered.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No results found</div>
              <div style={{ fontSize: 13 }}>Try a different search or browse all subjects</div>
            </div>
          )}
          {filtered.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              col={SUBJECT_COLORS[video.subject]}
              onClick={() => onSelectVideo(video)}
              saved={savedIds.has(video.id)}
              vote={votes[video.id] ?? null}
              onToggleSave={onToggleSave}
              onVote={onVote}
            />
          ))}
        </div>
        </div>}
      </main>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(74,123,255,0.05), transparent)", pointerEvents: "none" }} />
    </div>
  );
}
