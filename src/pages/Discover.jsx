import { useState, useMemo } from "react";
import { SUBJECT_COLORS, VIDEOS } from "../data/data.js";
import { VideoCard } from "../components/components.jsx";

export default function DiscoverPage({ onSelectVideo }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

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
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#e8e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }

        .card {
          background: #12121e; border-radius: 14px; overflow: hidden;
          cursor: pointer; position: relative;
          transition: transform 0.22s cubic-bezier(.22,.68,0,1.2), box-shadow 0.22s ease;
          border: 1px solid #1e1e2e;
        }
        .card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          border-color: #2e2e4e;
        }
        .thumb-wrap {
          position: relative; width: 100%; padding-bottom: 56.25%;
          overflow: hidden; background: #0d0d1a;
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
          width: 100%; background: #1a1a2e; border: 1.5px solid #2a2a40;
          border-radius: 12px; padding: 12px 18px 12px 46px;
          color: #e8e8f0; font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .search-input::placeholder { color: #555570; }
        .search-input:focus { border-color: #4a4a7a; }
        .grid-3 {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        @media (max-width: 900px) { .grid-3 { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 580px) { .grid-3 { grid-template-columns: 1fr; } }
        .logo-dot {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          background: #4a7bff; margin-left: 2px; vertical-align: middle; position: relative; top: -2px;
        }
        .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: #444460;
        }
        .stat-pill {
          display: inline-flex; align-items: center; gap: 4px; color: #555570; font-size: 11px;
        }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1a1a2a", padding: "0 32px",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
              edu<span style={{ color: "#4a7bff" }}>scroll</span>
            </span>
            <span className="logo-dot" />
          </div>
          <nav style={{ display: "flex", gap: 28, fontSize: 13, color: "#666680" }}>
            <span style={{ color: "#e8e8f0", fontWeight: 500, cursor: "pointer" }}>Discover</span>
            <span style={{ cursor: "pointer" }}>Saved</span>
            <span style={{ cursor: "pointer" }}>Progress</span>
          </nav>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
            background: "linear-gradient(135deg, #4a7bff, #9b27af)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 600,
          }}>S</div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-1px" }}>
            Learn anything,<br /><span style={{ color: "#4a7bff" }}>one scroll</span> at a time.
          </h1>
          <p style={{ color: "#666680", fontSize: 15 }}>
            {VIDEOS.length} curated lessons across {Object.keys(SUBJECT_COLORS).length} subjects
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8e8f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555570", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
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
                  background: isActive ? (col ? col.bg : "#4a7bff") : "#1a1a2e",
                  color: isActive ? "#fff" : "#888898",
                  border: isActive ? "1.5px solid transparent" : "1.5px solid #2a2a3a",
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
          <div style={{ marginBottom: 20, fontSize: 13, color: "#555570" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {activeTag !== "All" && <span> in <strong style={{ color: SUBJECT_COLORS[activeTag]?.bg }}>{activeTag}</strong></span>}
            {search && <span> for "<strong style={{ color: "#e8e8f0" }}>{search}</strong>"</span>}
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
            />
          ))}
        </div>
      </main>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(74,123,255,0.05), transparent)", pointerEvents: "none" }} />
    </div>
  );
}