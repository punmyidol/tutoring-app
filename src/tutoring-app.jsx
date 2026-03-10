import { useState, useMemo, useRef, useEffect } from "react";

const SUBJECT_COLORS = {
  Math: { bg: "#1a2fff", light: "#e8ebff", emoji: "∑" },
  Science: { bg: "#ff6b1a", light: "#fff0e8", emoji: "⚗" },
  History: { bg: "#b8860b", light: "#fff8e1", emoji: "⏳" },
  Coding: { bg: "#00c896", light: "#e0fff5", emoji: "</>" },
  Languages: { bg: "#e91e8c", light: "#ffe0f3", emoji: "Aa" },
  "Art & Music": { bg: "#9b27af", light: "#f3e0ff", emoji: "♪" },
  Philosophy: { bg: "#546e7a", light: "#eceff1", emoji: "∞" },
  Economics: { bg: "#2e7d32", light: "#e8f5e9", emoji: "$" },
};

const VIDEOS = [
  { id: 1, title: "The Beauty of Calculus", creator: "3Blue1Brown", subject: "Math", duration: "3:21", views: "2.1M", youtubeId: "WUvTyaaNkzM", desc: "A visual exploration of calculus fundamentals." },
  { id: 2, title: "How DNA Works", creator: "Kurzgesagt", subject: "Science", duration: "4:10", views: "8.4M", youtubeId: "zwibgNGe4aY", desc: "The molecular machinery behind all life." },
  { id: 3, title: "The Fall of Rome Explained", creator: "OverSimplified", subject: "History", duration: "5:45", views: "12M", youtubeId: "NG6_jQCGv5c", desc: "Why did the greatest empire collapse?" },
  { id: 4, title: "Python in 100 Seconds", creator: "Fireship", subject: "Coding", duration: "1:40", views: "3.7M", youtubeId: "x7X9w_GIm1s", desc: "Everything you need to know about Python, fast." },
  { id: 5, title: "How Languages Evolve", creator: "TED-Ed", subject: "Languages", duration: "4:28", views: "5.2M", youtubeId: "iWDKsHm6gTA", desc: "The fascinating journey of human language over time." },
  { id: 6, title: "Music Theory in 16 Minutes", creator: "Signals Music", subject: "Art & Music", duration: "16:01", views: "1.9M", youtubeId: "rgaTLrZGlk0", desc: "Understand the building blocks of all music." },
  { id: 7, title: "Plato's Allegory of the Cave", creator: "TED-Ed", subject: "Philosophy", duration: "4:32", views: "14M", youtubeId: "1RWOpQXTltA", desc: "One of philosophy's most famous thought experiments." },
  { id: 8, title: "Supply & Demand Explained", creator: "EconplusDal", subject: "Economics", duration: "6:13", views: "890K", youtubeId: "g9aDizJpd0s", desc: "The core concept driving every market on Earth." },
  { id: 9, title: "The Riemann Hypothesis", creator: "Veritasium", subject: "Math", duration: "7:50", views: "6.3M", youtubeId: "zlm1aajH6gY", desc: "The million-dollar unsolved math problem." },
  { id: 10, title: "Black Holes Explained", creator: "Kurzgesagt", subject: "Science", duration: "5:55", views: "22M", youtubeId: "e-P5IFTqB98", desc: "From birth to death of the universe's strangest objects." },
  { id: 11, title: "World War I in a Nutshell", creator: "OverSimplified", subject: "History", duration: "6:02", views: "18M", youtubeId: "Mun1dKkc_As", desc: "How one assassination sparked a global war." },
  { id: 12, title: "CSS Grid in 20 Minutes", creator: "Traversy Media", subject: "Coding", duration: "20:00", views: "1.1M", youtubeId: "jV8B24rSN5o", desc: "Master the most powerful CSS layout system." },
  { id: 13, title: "How to Learn Any Language", creator: "Xiaoma", subject: "Languages", duration: "8:14", views: "3.4M", youtubeId: "illApgaLgGA", desc: "Science-backed strategies for language acquisition." },
  { id: 14, title: "The History of Jazz", creator: "PBS", subject: "Art & Music", duration: "9:20", views: "780K", youtubeId: "O-dNDTsHKLI", desc: "America's greatest contribution to world music." },
  { id: 15, title: "Nietzsche's Philosophy", creator: "Academy of Ideas", subject: "Philosophy", duration: "12:10", views: "2.2M", youtubeId: "wHWbZmg2hzU", desc: "God is dead, and we have killed him. What now?" },
  { id: 16, title: "How Inflation Works", creator: "EconplusDal", subject: "Economics", duration: "5:30", views: "1.5M", youtubeId: "PNp-khAJFRE", desc: "Why your money buys less every year." },
  { id: 17, title: "Linear Algebra Visualized", creator: "3Blue1Brown", subject: "Math", duration: "14:59", views: "4.1M", youtubeId: "kjBOesZCoqc", desc: "See matrix transformations like never before." },
  { id: 18, title: "The Immune System Explained", creator: "Kurzgesagt", subject: "Science", duration: "6:44", views: "16M", youtubeId: "zQGOcOUBi6s", desc: "Your body's microscopic defense force." },
];

// ─── Video Player Page ────────────────────────────────────────────────────────

function VideoPlayerPage({ video, onBack, onNext, onPrev, allVideos }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [entered, setEntered] = useState(false);
  const controlsTimeout = useRef(null);
  const col = SUBJECT_COLORS[video.subject];

  // Suggestions: other videos from same subject (or just next few)
  const suggestions = allVideos.filter(v => v.id !== video.id && v.subject === video.subject).slice(0, 4);

  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 30);
    return () => clearTimeout(t);
  }, [video.id]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.load();
    vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [video.id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "Escape") onBack();
      if (e.code === "ArrowRight") onNext();
      if (e.code === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing]);

  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setPlaying(true); }
    else { vid.pause(); setPlaying(false); }
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
    const pct = (e.clientX - rect.left) / rect.width;
    vid.currentTime = pct * vid.duration;
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

  // Path convention: /assets/{youtubeId}.mp4
  const videoSrc = `./assets/${video.youtubeId}.mp4`;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#000",
        display: "flex", flexDirection: "column",
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "scale(1.02)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      <style>{`
        .vp-scrubber {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          width: 100%;
        }
        .vp-scrubber::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
          transition: transform 0.15s;
        }
        .vp-scrubber:hover::-webkit-slider-thumb { transform: scale(1.3); }
        .vp-vol {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          width: 80px;
        }
        .vp-vol::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
        }
        .suggestion-card {
          cursor: pointer;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.2s, opacity 0.2s;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .suggestion-card:hover { transform: scale(1.03); opacity: 1 !important; }
      `}</style>

      {/* ── Video element ── */}
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); onNext(); }}
        onClick={togglePlay}
        playsInline
      />

      {/* ── Gradient overlays ── */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 20%, transparent 65%, rgba(0,0,0,0.85) 100%)", pointerEvents: "none" }} />

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", gap: 16,
        padding: "18px 24px",
        opacity: showControls ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: showControls ? "auto" : "none",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.12)", border: "none",
            color: "#fff", cursor: "pointer",
            width: 40, height: 40, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
            fontSize: 18, transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        >
          ←
        </button>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{video.title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{video.creator}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            background: col.bg + "cc", color: "#fff",
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 99, letterSpacing: 0.5,
            backdropFilter: "blur(6px)",
          }}>
            {col.emoji} {video.subject}
          </span>
        </div>
      </div>

      {/* ── Center play/pause indicator (flash on click) ── */}
      <div
        onClick={togglePlay}
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "none", userSelect: "none",
        }}
      />

      {/* ── Bottom controls ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 24px 28px",
        opacity: showControls ? 1 : 0,
        transition: "opacity 0.3s",
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
              background: `linear-gradient(to right, ${col.bg} ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
            }}
            onChange={(e) => {
              const vid = videoRef.current;
              if (!vid) return;
              const pct = parseFloat(e.target.value) / 100;
              vid.currentTime = pct * vid.duration;
            }}
          />
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

          {/* Prev */}
          <ControlBtn onClick={onPrev} title="Previous (←)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </ControlBtn>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              background: "#fff", border: "none", cursor: "pointer",
              width: 48, height: 48, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", transition: "transform 0.15s, background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          {/* Next */}
          <ControlBtn onClick={onNext} title="Next (→)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zM16 6v12h2V6h-2z"/></svg>
          </ControlBtn>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ControlBtn onClick={toggleMute} title="Mute">
              {muted || volume === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              )}
            </ControlBtn>
            <input
              type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              className="vp-vol"
              style={{ background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)` }}
              onChange={handleVolumeChange}
            />
          </div>

          {/* Time */}
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums", marginLeft: 4 }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Fullscreen hint */}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>ESC to go back · ←→ to navigate</span>
        </div>
      </div>

      {/* ── Side suggestions panel ── */}
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 10, width: 180,
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s",
          pointerEvents: showControls ? "auto" : "none",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            More {video.subject}
          </div>
          {suggestions.map(s => (
            <SuggestionCard key={s.id} video={s} col={SUBJECT_COLORS[s.subject]} />
          ))}
        </div>
      )}
    </div>
  );
}

function ControlBtn({ onClick, title, children }) {
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

function SuggestionCard({ video, col }) {
  return (
    <div
      className="suggestion-card"
      style={{ opacity: 0.75, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
    >
      <div style={{ position: "relative", paddingBottom: "56.25%" }}>
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: col.bg }} />
        <span style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3 }}>{video.duration}</span>
      </div>
      <div style={{ padding: "6px 8px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.3, marginBottom: 2 }}>{video.title}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{video.creator}</div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function EduScroll() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [hoveredId, setHoveredId] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null); // null = grid view

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

  const handleNext = () => {
    if (!playingVideo) return;
    const idx = VIDEOS.findIndex(v => v.id === playingVideo.id);
    const next = VIDEOS[(idx + 1) % VIDEOS.length];
    setPlayingVideo(next);
  };

  const handlePrev = () => {
    if (!playingVideo) return;
    const idx = VIDEOS.findIndex(v => v.id === playingVideo.id);
    const prev = VIDEOS[(idx - 1 + VIDEOS.length) % VIDEOS.length];
    setPlayingVideo(prev);
  };

  return (
    <>
      {/* ── Video Player overlay ── */}
      {playingVideo && (
        <VideoPlayerPage
          video={playingVideo}
          allVideos={VIDEOS}
          onBack={() => setPlayingVideo(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {/* ── Grid Page ── */}
      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#e8e8f0" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #0a0a0f; }
          ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
          .card {
            background: #12121e;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.22s cubic-bezier(.22,.68,0,1.2), box-shadow 0.22s ease;
            border: 1px solid #1e1e2e;
            position: relative;
          }
          .card:hover {
            transform: translateY(-6px) scale(1.01);
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            border-color: #2e2e4e;
          }
          .thumb-wrap {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            overflow: hidden;
            background: #0d0d1a;
          }
          .thumb-wrap img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
          }
          .card:hover .thumb-wrap img { transform: scale(1.05); }
          .play-btn {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(2px);
          }
          .card:hover .play-btn { opacity: 1; }
          .play-circle {
            width: 52px; height: 52px;
            background: rgba(255,255,255,0.95);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          }
          .play-triangle {
            width: 0; height: 0;
            border-style: solid;
            border-width: 9px 0 9px 17px;
            border-color: transparent transparent transparent #111;
            margin-left: 3px;
          }
          .duration-badge {
            position: absolute;
            bottom: 8px; right: 8px;
            background: rgba(0,0,0,0.85);
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 7px;
            border-radius: 5px;
            letter-spacing: 0.3px;
          }
          .tag-pill {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 10px;
            font-weight: 600;
            padding: 3px 9px;
            border-radius: 99px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .filter-btn {
            border: none;
            cursor: pointer;
            padding: 8px 18px;
            border-radius: 99px;
            font-size: 13px;
            font-weight: 500;
            font-family: inherit;
            transition: all 0.18s ease;
            letter-spacing: 0.2px;
            white-space: nowrap;
          }
          .search-input {
            width: 100%;
            background: #1a1a2e;
            border: 1.5px solid #2a2a40;
            border-radius: 12px;
            padding: 12px 18px 12px 46px;
            color: #e8e8f0;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s;
          }
          .search-input::placeholder { color: #555570; }
          .search-input:focus { border-color: #4a4a7a; }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          @media (max-width: 900px) { .grid-3 { grid-template-columns: repeat(2,1fr); } }
          @media (max-width: 580px) { .grid-3 { grid-template-columns: 1fr; } }
          .logo-dot {
            display: inline-block;
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #4a7bff;
            margin-left: 2px;
            vertical-align: middle;
            position: relative;
            top: -2px;
          }
          .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 80px 20px;
            color: #444460;
          }
          .stat-pill {
            display: inline-flex; align-items: center; gap: 4px;
            color: #555570; font-size: 11px;
          }
        `}</style>

        {/* Header */}
        <header style={{ borderBottom: "1px solid #1a1a2a", padding: "0 32px", position: "sticky", top: 0, background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)", zIndex: 100 }}>
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
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4a7bff, #9b27af)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              S
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px 80px" }}>

          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-1px" }}>
              Learn anything,<br /><span style={{ color: "#4a7bff" }}>one scroll</span> at a time.
            </h1>
            <p style={{ color: "#666680", fontSize: 15, fontWeight: 400 }}>
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
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555570", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
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

          {/* Video Grid */}
          <div className="grid-3">
            {filtered.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No results found</div>
                <div style={{ fontSize: 13 }}>Try a different search or browse all subjects</div>
              </div>
            )}

            {filtered.map((video, i) => {
              const col = SUBJECT_COLORS[video.subject];
              return (
                <div
                  key={video.id}
                  className="card"
                  onClick={() => setPlayingVideo(video)}
                  onMouseEnter={() => setHoveredId(video.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
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
                      <span className="tag-pill" style={{ background: col?.bg + "22", color: col?.bg }}>
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
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: col?.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                          {video.creator[0]}
                        </div>
                        <span style={{ fontSize: 12, color: "#777790", fontWeight: 500 }}>{video.creator}</span>
                      </div>
                      <span className="stat-pill">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {video.views}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(74,123,255,0.05), transparent)", pointerEvents: "none" }} />
      </div>
    </>
  );
}