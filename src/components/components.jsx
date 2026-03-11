// ControlBtn — circular icon button for the video player toolbar
export function ControlBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "rgba(255,255,255,0.1)", border: "none",
        color: "#fff", cursor: "pointer",
        width: 48, height: 48, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)", transition: "background 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
    >
      {children}
    </button>
  );
}

// SuggestionCard — small video card shown in the side panel while a video is playing
export function SuggestionCard({ video, col, onClick }) {
  return (
    <div
      className="suggestion-card"
      onClick={onClick}
      style={{ opacity: 0.75, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", cursor: "pointer" }}
    >
      <div style={{ position: "relative", paddingBottom: "56.25%" }}>
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: col.bg }} />
        <span style={{
          position: "absolute", bottom: 4, right: 4,
          background: "rgba(0,0,0,0.8)", color: "#fff",
          fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3,
        }}>
          {video.duration}
        </span>
      </div>
      <div style={{ padding: "6px 8px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.3, marginBottom: 2 }}>
          {video.title}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{video.creator}</div>
      </div>
    </div>
  );
}

// VideoCard — thumbnail card shown in the main discovery grid
export function VideoCard({ video, col, onClick, saved, vote, onToggleSave, onVote }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="thumb-wrap">
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          loading="lazy"
        />
        <div className="play-btn">
          <div className="play-circle">
            <div className="play-triangle" />
          </div>
        </div>
        <span className="duration-badge">{video.duration}</span>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: col?.bg }} />
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ marginBottom: 8 }}>
          <span
            className="tag-pill"
            style={{ background: col?.bg + "22", color: col?.bg }}
          >
            {col?.emoji} {video.subject}
          </span>
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 5, color: "var(--text)", letterSpacing: "-0.1px" }}>
          {video.title}
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 10 }}>
          {video.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: col?.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff",
            }}>
              {video.creator[0]}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{video.creator}</span>
          </div>
          <span className="stat-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {video.views}
          </span>
        </div>

        {/* Action row — stop propagation so clicks don't open the player */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 5, paddingTop: 10, borderTop: "1px solid var(--border)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Upvote */}
          <button
            className={`action-btn${vote === 'up' ? ' active-up' : ''}`}
            onClick={() => onVote(video.id, 'up')}
            title="Upvote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.88v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 2 6.59 8.59C6.22 8.95 6 9.45 6 10v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.11z"/></svg>
          </button>

          {/* Downvote */}
          <button
            className={`action-btn${vote === 'down' ? ' active-down' : ''}`}
            onClick={() => onVote(video.id, 'down')}
            title="Downvote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12C2.06 11.37 2 11.64 2 12v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 22l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2H7c-.83 0-1.54.5-1.84 1.22L2.17 11.12z"/></svg>
          </button>

          <div style={{ flex: 1 }} />

          {/* Heart / Save */}
          <button
            className={`action-btn${saved ? ' active-heart' : ''}`}
            onClick={() => onToggleSave(video.id)}
            title={saved ? "Remove from saved" : "Save video"}
          >
            {saved
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
