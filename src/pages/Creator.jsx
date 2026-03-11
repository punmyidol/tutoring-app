import { useState, useRef } from "react";
import { SUBJECT_COLORS } from "../data/data.js";

const SUBJECTS = Object.keys(SUBJECT_COLORS);

function generateThumbnail(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.src = url;
    vid.muted = true;
    vid.playsInline = true;
    vid.onloadeddata = () => { vid.currentTime = 0.5; };
    vid.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = vid.videoWidth || 320;
      canvas.height = vid.videoHeight || 568;
      canvas.getContext("2d").drawImage(vid, 0, 0, canvas.width, canvas.height);
      resolve({ src: url, thumbnail: canvas.toDataURL("image/jpeg", 0.8), duration: vid.duration });
    };
    vid.onerror = () => resolve({ src: url, thumbnail: null, duration: 0 });
  });
}

function fmt(s) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function CreatorPage({ uploadedVideos, onAddVideo, onSelectVideo }) {
  const [dragging, setDragging]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pending, setPending]       = useState(null); // { src, thumbnail, duration }
  const [form, setForm]             = useState({ title: "", desc: "", subject: "Coding", creator: "You" });
  const fileInputRef                = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("video/")) return;
    setProcessing(true);
    const result = await generateThumbnail(file);
    setPending(result);
    setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }));
    setProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handlePost = () => {
    if (!pending || !form.title.trim()) return;
    onAddVideo({
      id: `upload_${Date.now()}`,
      title: form.title.trim(),
      creator: form.creator.trim() || "You",
      subject: form.subject,
      duration: fmt(pending.duration || 0),
      views: "0",
      youtubeId: null,
      localSrc: pending.src,
      thumbnail: pending.thumbnail,
      desc: form.desc.trim() || "User uploaded video.",
      isUserVideo: true,
    });
    setPending(null);
    setForm({ title: "", desc: "", subject: "Coding", creator: "You" });
  };

  const cancel = () => {
    setPending(null);
    setForm({ title: "", desc: "", subject: "Coding", creator: "You" });
  };

  const inputStyle = {
    width: "100%", background: "var(--bg-input)", border: "1.5px solid var(--border-input)",
    borderRadius: 10, padding: "10px 14px", color: "var(--text)",
    fontSize: 14, fontFamily: "inherit", outline: "none",
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.6,
    textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  return (
    <div style={{ padding: "36px 24px 80px", maxWidth: 860, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: "-1px", color: "var(--text)" }}>
          Creator <span style={{ color: "#4a7bff" }}>Studio</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Upload your own short educational clips and play them instantly
        </p>
      </div>

      {/* ── Upload zone ── */}
      {!pending && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#4a7bff" : "var(--border-muted)"}`,
            borderRadius: 20, padding: "64px 40px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            cursor: processing ? "wait" : "pointer",
            background: dragging ? "rgba(74,123,255,0.06)" : "var(--bg-secondary)",
            transition: "all 0.2s", marginBottom: 40,
          }}
        >
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: "rgba(74,123,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {processing
              ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a7bff" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a7bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
            }
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
              {processing ? "Processing video…" : "Drop your video here"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              or click to browse · MP4, MOV, WebM supported
            </div>
          </div>
          <input
            ref={fileInputRef} type="file" accept="video/*"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* ── Post form ── */}
      {pending && (
        <div style={{
          background: "var(--bg-secondary)", border: "1px solid var(--border)",
          borderRadius: 20, padding: 28, marginBottom: 40,
          display: "grid", gridTemplateColumns: "180px 1fr", gap: 28,
        }}>
          {/* Video preview */}
          <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "9/16", background: "#000" }}>
            <video src={pending.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} controls playsInline />
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What's this video about?"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                placeholder="Brief description of what you teach…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={inputStyle}
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{SUBJECT_COLORS[s].emoji} {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input
                  value={form.creator}
                  onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}
                  placeholder="Creator name"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={handlePost}
                disabled={!form.title.trim()}
                style={{
                  background: form.title.trim() ? "#4a7bff" : "var(--bg-input)",
                  color: form.title.trim() ? "#fff" : "var(--text-dim)",
                  border: "none", cursor: form.title.trim() ? "pointer" : "not-allowed",
                  borderRadius: 10, padding: "12px 28px",
                  fontSize: 14, fontWeight: 600, fontFamily: "inherit", transition: "opacity 0.2s",
                }}
              >
                Post Video
              </button>
              <button
                onClick={cancel}
                style={{
                  background: "var(--bg-input)", color: "var(--text-muted)",
                  border: "1px solid var(--border)", cursor: "pointer",
                  borderRadius: 10, padding: "12px 20px",
                  fontSize: 14, fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Your videos grid ── */}
      {uploadedVideos.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>
            Your Videos · {uploadedVideos.length}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {uploadedVideos.map(video => {
              const col = SUBJECT_COLORS[video.subject];
              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  style={{
                    background: "var(--bg-secondary)", borderRadius: 14, overflow: "hidden",
                    cursor: "pointer", border: "1px solid var(--border)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ position: "relative", paddingBottom: "177.78%", background: "#111" }}>
                    {video.thumbnail
                      ? <img src={video.thumbnail} alt={video.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)", fontSize: 36 }}>▶</div>
                    }
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: col?.bg }} />
                    <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>
                      {video.duration}
                    </span>
                    <span style={{ position: "absolute", top: 8, left: 8, background: "#4a7bff", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
                      You
                    </span>
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, marginBottom: 3 }}>
                      {video.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{video.subject}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uploadedVideos.length === 0 && !pending && !processing && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-very-dim)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎬</div>
          <div style={{ fontSize: 14 }}>Your uploaded videos will appear here</div>
        </div>
      )}
    </div>
  );
}
