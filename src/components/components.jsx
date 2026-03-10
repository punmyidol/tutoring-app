// ControlBtn — circular icon button for the video player toolbar
export function ControlBtn({ onClick, title, children }) {
    return (
      <button
        onClick={onClick}
        title={title}
        style={{
          background: "rgba(255,255,255,0.1)", border: "none",
          color: "#fff", cursor: "pointer",
          width: 36, height: 36, borderRadius: "50%",
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
  export function VideoCard({ video, col, onClick }) {
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
          <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 5, color: "#e8e8f0", letterSpacing: "-0.1px" }}>
            {video.title}
          </h3>
          <p style={{ fontSize: 12, color: "#555570", lineHeight: 1.5, marginBottom: 12 }}>
            {video.desc}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: col?.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "#fff",
              }}>
                {video.creator[0]}
              </div>
              <span style={{ fontSize: 12, color: "#777790", fontWeight: 500 }}>{video.creator}</span>
            </div>
            <span className="stat-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {video.views}
            </span>
          </div>
        </div>
      </div>
    );
  }