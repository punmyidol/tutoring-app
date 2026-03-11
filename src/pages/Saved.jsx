import { useState, useMemo } from "react";
import { SUBJECT_COLORS, VIDEOS } from "../data/data.js";
import { VideoCard } from "../components/components.jsx";

export default function SavedPage({ savedIds, votes, onToggleSave, onVote, onSelectVideo }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const savedVideos = useMemo(() => VIDEOS.filter(v => savedIds.has(v.id)), [savedIds]);

  const tags = useMemo(() => {
    const subjects = [...new Set(savedVideos.map(v => v.subject))];
    return ["All", ...subjects];
  }, [savedVideos]);

  const filtered = useMemo(() => {
    return savedVideos.filter(v => {
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
  }, [savedVideos, search, activeTag]);

  return (
    <div style={{ padding: "36px 24px 80px", width: "100%", boxSizing: "border-box" }}>

      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-1px", color: "var(--text)" }}>
          Your <span style={{ color: "#ff4a7b" }}>saved</span> videos.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          {savedVideos.length === 0
            ? "Heart a video to save it here"
            : `${savedVideos.length} saved lesson${savedVideos.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {savedVideos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-very-dim)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No saved videos yet</div>
          <div style={{ fontSize: 13 }}>Tap the heart on any video to save it here</div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4, color: "var(--text)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search saved videos..."
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

          {/* Subject filter — only subjects present in saved videos */}
          {tags.length > 2 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 24, scrollbarWidth: "none" }}>
              {tags.map(tag => {
                const isActive = activeTag === tag;
                const col = SUBJECT_COLORS[tag];
                return (
                  <button
                    key={tag}
                    className="filter-btn"
                    onClick={() => setActiveTag(tag)}
                    style={{
                      background: isActive ? (col ? col.bg : "#ff4a7b") : "var(--bg-input)",
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
          )}

          {/* Results count when filtering */}
          {(search || activeTag !== "All") && filtered.length > 0 && (
            <div style={{ marginBottom: 16, fontSize: 13, color: "var(--text-dim)" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Grid */}
          <div className="grid-3">
            {filtered.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No results</div>
                <div style={{ fontSize: 13 }}>Try a different search term</div>
              </div>
            )}
            {filtered.map(video => (
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
        </>
      )}
    </div>
  );
}
