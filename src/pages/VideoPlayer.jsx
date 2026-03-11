import { useState, useRef, useEffect } from "react";
import { SUBJECT_COLORS } from "../data/data.js";
import { ControlBtn, SuggestionCard } from "../components/components.jsx";

export default function VideoPlayerPage({ video, onBack, onNext, onPrev, allVideos, savedVideos = [], onToggleSave, onWatched }) {
  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);
  const playedSeconds = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [entered, setEntered] = useState(false);

  // Per-video vote: null | "up" | "down"
  const [votes, setVotes] = useState({});
  const vote = votes[video.id] ?? null;
  const isSaved = savedVideos.includes(video.id);

  const handleVote = (dir) => {
    setVotes(prev => ({ ...prev, [video.id]: prev[video.id] === dir ? null : dir }));
  };

  const col = SUBJECT_COLORS[video.subject];
  const videoSrc = `./assets/${video.youtubeId}.mp4`;

  const suggestions = allVideos
    .filter(v => v.id !== video.id && v.subject === video.subject)
    .slice(0, 4);

  // Fade-in on mount / video change
  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 30);
    return () => clearTimeout(t);
  }, [video.id]);

  // Auto-play when video changes; reset play-time counter
  useEffect(() => {
    playedSeconds.current = 0;
    const vid = videoRef.current;
    if (!vid) return;
    vid.load();
    vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [video.id]);

  // Accumulate seconds while playing
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => { playedSeconds.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space")      { e.preventDefault(); togglePlay(); }
      if (e.code === "Escape")     reportAndGo(onBack);
      if (e.code === "ArrowRight") reportAndGo(onNext);
      if (e.code === "ArrowLeft")  reportAndGo(onPrev);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing]);

  const reportAndGo = (fn) => { onWatched?.(video.id, playedSeconds.current); playedSeconds.current = 0; fn(); };

  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play();  setPlaying(true);  }
    else            { vid.pause(); setPlaying(false); }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    setProgress(vid.duration ? (vid.currentTime / vid.duration) * 100 : 0);
  };

  const handleSeek = (e) => {
    const vid = videoRef.current;
    if (!vid) return;
    const rect = e.currentTarget.getBoundingClientRect();
    vid.currentTime = ((e.clientX - rect.left) / rect.width) * vid.duration;
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !muted;
    setMuted(!muted);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#000",
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "scale(1.02)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <style>{`
        .vp-scrubber {
          -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 2px; outline: none; cursor: pointer; width: 100%;
        }
        .vp-scrubber::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #fff; cursor: pointer;
          box-shadow: 0 0 4px rgba(0,0,0,0.5); transition: transform 0.15s;
        }
        .vp-scrubber:hover::-webkit-slider-thumb { transform: scale(1.3); }
        .vp-vol {
          -webkit-appearance: none; appearance: none;
          height: 3px; border-radius: 2px; outline: none; cursor: pointer; width: 80px;
        }
        .vp-vol::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px; border-radius: 50%; background: #fff; cursor: pointer;
        }
        .suggestion-card {
          border-radius: 10px; overflow: hidden;
          transition: transform 0.2s, opacity 0.2s;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .suggestion-card:hover { transform: scale(1.03); opacity: 1 !important; }
      `}</style>

      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); reportAndGo(onNext); }}
        onClick={togglePlay}
        playsInline
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 20%, transparent 65%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", gap: 16, padding: "18px 24px",
        opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
        pointerEvents: showControls ? "auto" : "none",
      }}>
        <button
          onClick={() => reportAndGo(onBack)}
          style={{
            background: "rgba(255,255,255,0.12)", border: "none", color: "#fff",
            cursor: "pointer", width: 48, height: 48, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)", fontSize: 18, transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        >
          ←
        </button>

        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
            {video.title}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{video.creator}</div>
        </div>

        <div style={{ marginLeft: "auto" }}>
          <span style={{
            background: col.bg + "cc", color: "#fff",
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 99, letterSpacing: 0.5, backdropFilter: "blur(6px)",
          }}>
            {col.emoji} {video.subject}
          </span>
        </div>
      </div>

      {/* Click-to-toggle area */}
      <div
        onClick={togglePlay}
        style={{ position: "absolute", inset: 0, cursor: "none", userSelect: "none" }}
      />

      {/* ── Bottom controls ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px",
        opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
        pointerEvents: showControls ? "auto" : "none",
      }}>
        {/* Scrubber */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          <div
            style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, cursor: "pointer", position: "relative" }}
            onClick={handleSeek}
          >
            <div style={{ height: "100%", width: `${progress}%`, background: col.bg, borderRadius: 2, transition: "width 0.1s" }} />
          </div>
          <input
            type="range" min="0" max="100" value={progress}
            className="vp-scrubber"
            style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              transform: "translateY(-50%)", opacity: 0, width: "100%",
            }}
            onChange={(e) => {
              const vid = videoRef.current;
              if (!vid) return;
              vid.currentTime = (parseFloat(e.target.value) / 100) * vid.duration;
            }}
          />
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ControlBtn onClick={() => reportAndGo(onPrev)} title="Previous (←)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </ControlBtn>

          <button
            onClick={togglePlay}
            style={{
              background: "#fff", border: "none", cursor: "pointer",
              width: 60, height: 60, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", transition: "transform 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {playing
              ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z"/></svg>
            }
          </button>

          <ControlBtn onClick={() => reportAndGo(onNext)} title="Next (→)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6v12h2V6h-2z"/></svg>
          </ControlBtn>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ControlBtn onClick={toggleMute} title="Mute">
              {muted || volume === 0
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              }
            </ControlBtn>
            <input
              type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              className="vp-vol"
              style={{ background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)` }}
              onChange={handleVolumeChange}
            />
          </div>

          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums", marginLeft: 4 }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div style={{ flex: 1 }} />

          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            ESC to go back · ←→ to navigate
          </span>
        </div>
      </div>

      {/* ── Action buttons (upvote / downvote / save) ── */}
      <div style={{
        position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
        pointerEvents: showControls ? "auto" : "none",
      }}>
        {/* Upvote */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleVote("up"); }}
            title="Upvote"
            style={{
              width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: vote === "up" ? "#4ade80" : "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              color: vote === "up" ? "#000" : "#fff",
              transition: "all 0.2s cubic-bezier(.22,.68,0,1.4)",
              transform: vote === "up" ? "scale(1.15)" : "scale(1)",
              boxShadow: vote === "up" ? "0 0 16px rgba(74,222,128,0.5)" : "none",
            }}
            onMouseEnter={e => { if (vote !== "up") e.currentTarget.style.background = "rgba(74,222,128,0.25)"; }}
            onMouseLeave={e => { if (vote !== "up") e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
          </button>
          <span style={{ fontSize: 10, color: vote === "up" ? "#4ade80" : "rgba(255,255,255,0.4)", fontWeight: 600, transition: "color 0.2s" }}>
            Like
          </span>
        </div>

        {/* Downvote */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleVote("down"); }}
            title="Downvote"
            style={{
              width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: vote === "down" ? "#f87171" : "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              color: vote === "down" ? "#000" : "#fff",
              transition: "all 0.2s cubic-bezier(.22,.68,0,1.4)",
              transform: vote === "down" ? "scale(1.15)" : "scale(1)",
              boxShadow: vote === "down" ? "0 0 16px rgba(248,113,113,0.5)" : "none",
            }}
            onMouseEnter={e => { if (vote !== "down") e.currentTarget.style.background = "rgba(248,113,113,0.25)"; }}
            onMouseLeave={e => { if (vote !== "down") e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
            </svg>
          </button>
          <span style={{ fontSize: 10, color: vote === "down" ? "#f87171" : "rgba(255,255,255,0.4)", fontWeight: 600, transition: "color 0.2s" }}>
            Dislike
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", borderRadius: 1 }} />

        {/* Save */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave?.(video.id); }}
            title={isSaved ? "Remove from saved" : "Save video"}
            style={{
              width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isSaved ? "#facc15" : "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              color: isSaved ? "#000" : "#fff",
              transition: "all 0.2s cubic-bezier(.22,.68,0,1.4)",
              transform: isSaved ? "scale(1.15)" : "scale(1)",
              boxShadow: isSaved ? "0 0 16px rgba(250,204,21,0.5)" : "none",
            }}
            onMouseEnter={e => { if (!isSaved) e.currentTarget.style.background = "rgba(250,204,21,0.25)"; }}
            onMouseLeave={e => { if (!isSaved) e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <span style={{ fontSize: 10, color: isSaved ? "#facc15" : "rgba(255,255,255,0.4)", fontWeight: 600, transition: "color 0.2s" }}>
            {isSaved ? "Saved" : "Save"}
          </span>
        </div>
      </div>

      {/* ── Side suggestions ── */}
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 10, width: 180,
          opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
          pointerEvents: showControls ? "auto" : "none",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            More {video.subject}
          </div>
          {suggestions.map(s => (
            <SuggestionCard
              key={s.id}
              video={s}
              col={SUBJECT_COLORS[s.subject]}
              onClick={() => { /* parent handles navigation via onNext/onPrev; expose setter if needed */ }}
            />
          ))}
        </div>
      )}
    </div>
  );
}